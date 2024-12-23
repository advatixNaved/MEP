import { NgModule } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialog, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';

const exportList = [
    ProgressSpinner,
    ButtonModule,
    InputTextModule,
    DynamicDialog,
    TextareaModule,
    Toast
]

@NgModule({
    imports:[
        ...exportList
    ],
    exports: [
        ...exportList
    ],
    providers: [ConfirmationService, MessageService, DialogService, DynamicDialogRef],
})
export class PrimeNgModule { }
