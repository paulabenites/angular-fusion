import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { Params, ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Comment } from '@angular/compiler';



@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

    // @Input()
  dish : Dish;
  dishIds: string[];
  prev: string;
  next: string;
  errMess: string;
  comment : Comment;
  commentForm: FormGroup;
  dishcopy:Dish;

  @ViewChild('cform') commentFormDirective;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages ={
    'author': {
      'required': 'Author name is required.',
      'minlength': 'Author name must be at least 2 characters long.'
    },
    'comment': {
      'required': 'Comment is required.'
    }
  }


  constructor(private dishservice:DishService, 
    private route: ActivatedRoute,
    private location:Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL
    ) {
      this.createForm();
     }

  ngOnInit() {

    this.dishservice.getDishIds().subscribe(dishIds=> this.dishIds = dishIds);

    this.route.params
    .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
    .subscribe(dish => { 
      this.dish = dish; 
      this.dishcopy = dish;
      this.setPrevNext(dish.id); 
    },
      errmess => this.errMess = <any>errmess);

  }

  createForm() {
    var localdate = new Date().toISOString();
    this.commentForm = this.fb.group( {
      author: ['', [Validators.required, Validators.minLength(2)]],
      comment: ['',[Validators.required]],
      rating: 5,
      date: localdate
    });
    this.commentForm.valueChanges.subscribe( data => this.onValueChanged(data) );

    this.onValueChanged();
  }

  onValueChanged(data?:any) {
    if(!this.commentForm) {return ;}
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if(this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if(control && control.dirty && !control.valid) {
          const message = this.validationMessages[field];
          for(const key in control.errors) {
            if(control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += message[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    console.log(this.commentForm.value);

    this.dishcopy.comments.push(this.commentForm.value);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => {
        this.dish = null;this.dishcopy = null;this.errMess = <any>errmess;
    });


    this.commentFormDirective.resetForm();
    var localdate = new Date().toISOString();
    this.commentForm.reset( {
      author: '',
      rating: 5,
      comment: '',
      date: localdate
    });
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[ (this.dishIds.length + index-1) % this.dishIds.length ]
    this.next = this.dishIds[ (this.dishIds.length + index+1) % this.dishIds.length ]
  }

  goBack():void {
    this.location.back();
  }

}
