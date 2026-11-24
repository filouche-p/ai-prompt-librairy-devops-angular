import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PromptPayload } from '../../models/prompt.model';

function nonBlankValidator(control: AbstractControl<string>): { required: true } | null {
  return control.value.trim().length > 0 ? null : { required: true };
}

@Component({
  selector: 'app-prompt-form',
  imports: [ReactiveFormsModule],
  templateUrl: './prompt-form.html',
})
export class PromptForm {
  private readonly fb = inject(FormBuilder);

  readonly promptSubmitted = output<PromptPayload>();

  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');
  private readonly categoryInput = viewChild<ElementRef<HTMLInputElement>>('categoryInput');
  private readonly promptInput = viewChild<ElementRef<HTMLTextAreaElement>>('promptInput');

  readonly submitted = signal(false);
  readonly statusMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, nonBlankValidator]],
    category: ['', [Validators.required, nonBlankValidator]],
    prompt: ['', [Validators.required, nonBlankValidator]],
  });

  isInvalid(field: 'title' | 'category' | 'prompt'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    const { title, category, prompt } = this.form.getRawValue();
    this.promptSubmitted.emit({
      title: title.trim(),
      category: category.trim(),
      prompt: prompt.trim(),
    });

    this.statusMessage.set(`Prompt « ${title.trim()} » ajouté en mémoire.`);
    this.form.reset({ title: '', category: '', prompt: '' });
    this.submitted.set(false);
  }

  private focusFirstInvalidField(): void {
    if (this.form.controls.title.invalid) {
      this.titleInput()?.nativeElement.focus();
      return;
    }
    if (this.form.controls.category.invalid) {
      this.categoryInput()?.nativeElement.focus();
      return;
    }
    if (this.form.controls.prompt.invalid) {
      this.promptInput()?.nativeElement.focus();
    }
  }
}
