import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        // Provide a minimal ActivatedRoute mock — the shell component
        // doesn't use route params, it just needs the DI token to exist.
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should render the layout structure', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    // Shell must contain header, sidebar and bottom-nav components
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    expect(compiled.querySelector('app-bottom-nav')).toBeTruthy();
  });

  it('should render the main content area', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const main = compiled.querySelector('main');

    // The <main> element is the content area where pages are rendered
    expect(main).toBeTruthy();
  });

  it('should contain a router-outlet for page navigation', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const outlet = compiled.querySelector('router-outlet');

    // router-outlet is where Angular renders the active page component
    expect(outlet).toBeTruthy();
  });
});
