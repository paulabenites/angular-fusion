import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Feedback, ContactType } from '../shared/Feedback';
import { flyInOut,visibility,expand} from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]' : 'true',
    'style': 'display:block;'
  },
  animations: [flyInOut(),expand()]
})
export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  feedback: Feedback;
  feedbackcopy: Feedback;
  contactType = ContactType;
  errMess: string;
  hideForm = false;
  hideSpinner = true;
  hideSubmission = true;

  @ViewChild('fform') feedbackFormDirective;

  formErrors = {
    'firstname': '',
    'lastname' : '',
    'telnum': '',
    'email': ''
  }; 

  validationMessages ={
    'firstname': {
      'required': 'First name is required.',
      'minlength': 'First name must be at least 2 characters long.',
      'maxlength': 'Firt name cannot be more than 25 characters long.'
    },
    'lastname': {
      'required': 'Last name is required.',
      'minlength': 'Last name must be at least 2 characters long.',
      'miaxlength': 'Last name cannot be more than 25 characters long.'
    },
    'telnum': {
      'required': 'Tel. number is required.',
      'pattern': 'Tel. number must contain only numbers.'
    },
    'email': {
      'required': 'Email is required.',
      'email': 'Email not in valid format.'
    }
  }

  constructor(private fb: FormBuilder,
    private feedbackservice:FeedbackService) {
    this.createForm();
    
  }

  ngOnInit() {
  }

  createForm() {
    this.feedbackForm = this.fb.group( {
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: [0, [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contactType: 'None',
      message: ''
    });
    this.feedbackForm.valueChanges.subscribe( data => this.onValueChanged(data) );

    this.onValueChanged();
  }

  onValueChanged(data?:any) {
    if(!this.feedbackForm) {return ;}
    const form = this.feedbackForm;
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
    this.hideForm = true;
    this.hideSpinner = false;
    this.hideSubmission = true;

    this.feedback = this.feedbackForm.value;
    console.log(this.feedback);
    this.feedbackservice.postFeedback(this.feedbackcopy)
      .subscribe(feedback => {
        this.hideForm = true;
        this.hideSpinner = true;
        this.hideSubmission = false;
        setTimeout(() => {
          this.feedback = feedback; 
          this.feedbackcopy = feedback;

          this.hideForm = false;
          this.hideSpinner = true;
          this.hideSubmission = true;
        }, 5000);
      },
      errmess => {
        this.feedback = null;this.feedbackcopy = null;this.errMess = <any>errmess;
    });

    this.feedbackForm.reset( {
      firstname: '',
      lastname: '',
      telnum: 0,
      email: '',
      agree: false,
      contactType : 'None',
      message: ''
    });

    this.feedbackFormDirective.resetForm();
  }

};
