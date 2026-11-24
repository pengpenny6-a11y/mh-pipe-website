import {useLayoutEffect} from 'react';

// Move the artwork inside its control. The focus ring, pointer target and
// canvas coordinates stay in their actual layout positions while scrolling.
export function useHomeChapterMotion(home, lang) {
  useLayoutEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger) return;
    const media = gsap.matchMedia();
    media.add('(min-width: 851px) and (prefers-reduced-motion: no-preference)', () => {
      const page = home.current;
      const passage = (trigger, end = 'top 66%') => gsap.timeline({
        defaults: {ease: 'power1.out'},
        scrollTrigger: {trigger, start: 'clamp(top bottom)', end: 'clamp(' + end + ')', scrub: true}
      });

      // The miniature objects open out from the centre as the banner clears.
      const directory = page.querySelector('.app-directory');
      passage(directory, 'top 48%')
        .from(directory.querySelector('h2'), {y: 22, duration: .55}, 0)
        .from(directory.querySelectorAll('.app-scene-sample'), {
          x: (i, element, items) => ((items.length - 1) / 2 - i) * 10,
          y: 17, scale: .89, duration: .68, stagger: {amount: .16, from: 'center'}
        }, .14);

      // Finish typesetting while the header is still in the lower third.
      // Photography, chapter controls and article text have their own timing.
      const titles = page.querySelectorAll('.series-heading h2, .mh-intro-support h2, .hmf-header h2, .hm-lab__text h2, .pw-heading h2, .mh-projects-head h2, .hnd-head h2');
      titles.forEach(title => {
        const film = passage(title.parentElement);
        film.from(title, {y: 19, duration: .75}, 0);
        const translation = title.querySelector('.mh-heading-english');
        if (translation) film.from(translation, {y: 8, opacity: .60, duration: .52}, .24);
      });

      const support = page.querySelector('.mh-intro-support nav');
      passage(support).from(support.querySelectorAll('.mh-support-symbol svg'), {
        y: 7, scale: .83, duration: .72, stagger: .07
      });

      const about = page.querySelector('.mh-about-film');
      passage(about, 'top 24%').from(about.querySelector('.mh-film-photos'), {
        scale:1.055, transformOrigin:'68% 34%', ease:'none'
      });

      const footer = page.querySelector('.mh-colophon-body');
      passage(footer, 'top 69%').from(footer.children, {y: 14, duration: .75, stagger: .06});
    }, home);
    return () => media.revert();
  }, [home, lang]);
}
