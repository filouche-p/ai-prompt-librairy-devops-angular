import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PromptService } from './prompt.service';

describe('PromptService', () => {
  let service: PromptService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PromptService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads prompts from prompts.json and updates the count label', async () => {
    const loadPromise = service.loadPrompts('prompts.json');

    const req = httpTesting.expectOne('prompts.json');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        title: 'Créer un Dockerfile Node.js',
        category: 'DevOps',
        prompt: 'Crée un Dockerfile optimisé.',
      },
      {
        title: 'Créer un Dockerfile Node.js',
        category: 'DevOps',
        prompt: 'Variante.',
      },
    ]);

    await loadPromise;

    expect(service.prompts().length).toBe(2);
    expect(service.prompts()[0].id).toBe('card-créer-un-dockerfile-node.js');
    expect(service.prompts()[1].id).toBe('card-créer-un-dockerfile-node.js-2');
    expect(service.promptCountLabel()).toBe('2 prompts');
  });

  it('adds a user prompt in memory with addedByUser flag and builds ChatGPT URL', () => {
    const item = service.addPrompt({
      title: 'Test Angular',
      category: 'Développement',
      prompt: 'Génère un service Angular.',
    });

    expect(item.addedByUser).toBe(true);
    expect(item.id).toBe('card-test-angular');
    expect(service.promptCountLabel()).toBe('1 prompt');
    expect(service.buildModelUrl(item.prompt)).toBe(
      `https://chatgpt.com/?q=${encodeURIComponent('Génère un service Angular.')}`,
    );
  });
});
