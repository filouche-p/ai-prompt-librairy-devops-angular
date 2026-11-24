import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('renders header, loads initial prompts, and allows adding a prompt in memory', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const req = httpTesting.expectOne('prompts.json');
    req.flush([
      {
        title: 'Créer un Dockerfile Node.js',
        category: 'DevOps',
        prompt: 'Crée un Dockerfile optimisé.',
      },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('AI Prompt Library');
    expect(compiled.querySelector('#prompt-count')?.textContent?.trim()).toBe('1 prompt');
    expect(compiled.querySelectorAll('#prompt-container article').length).toBe(1);

    const titleInput = compiled.querySelector('#title') as HTMLInputElement;
    const categoryInput = compiled.querySelector('#category') as HTMLInputElement;
    const promptTextarea = compiled.querySelector('#prompt') as HTMLTextAreaElement;
    const form = compiled.querySelector('#addPrompt') as HTMLFormElement;

    titleInput.value = 'Nouveau Prompt';
    titleInput.dispatchEvent(new Event('input'));
    categoryInput.value = 'Angular';
    categoryInput.dispatchEvent(new Event('input'));
    promptTextarea.value = 'Explique les signals Angular.';
    promptTextarea.dispatchEvent(new Event('input'));

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(compiled.querySelector('#prompt-count')?.textContent?.trim()).toBe('2 prompts');
    const cards = compiled.querySelectorAll('#prompt-container article');
    expect(cards.length).toBe(2);
    expect(cards[1].classList.contains('addedByUser')).toBe(true);
  });
});
