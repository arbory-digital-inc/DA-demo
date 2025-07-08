import { fetchPlaceholders } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
  
  // Update numbered variant data attributes
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (slideIndicators) {
    slideIndicators.dataset.currentSlide = slideIndex + 1;
    slideIndicators.dataset.totalSlides = slides.length;
  }
  
  // Update counter in the navigation row
  const counter = block.querySelector('.carousel-counter');
  const navigationRow = block.querySelector('.carousel-navigation-row');
  if (counter) {
    counter.dataset.currentSlide = slideIndex + 1;
    counter.dataset.totalSlides = slides.length;
  }
  
  // Update progress bar
  const progressBar = block.querySelector('.carousel-progress-bar');
  if (progressBar) {
    progressBar.dataset.currentSlide = slideIndex + 1;
    progressBar.dataset.totalSlides = slides.length;
  }
  
  // Update slide previews if they exist
  const slidePreviews = block.querySelectorAll('.slide-preview');
  if (slidePreviews.length > 0) {
    slidePreviews.forEach((preview, idx) => {
      if (idx === slideIndex) {
        preview.classList.add('active');
      } else {
        preview.classList.remove('active');
      }
    });
  }
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    
    if (block.classList.contains('numbered')) {
      // Create slide previews container
      const slidePreviews = document.createElement('ul');
      slidePreviews.classList.add('slide-previews');
      
      // Add slide previews to the nav (main area) and append first
      slideIndicatorsNav.append(slidePreviews);
      block.append(slideIndicatorsNav);
      
      // Create a new navigation row for counter and arrows
      const navigationRow = document.createElement('div');
      navigationRow.classList.add('carousel-navigation-row');
      
      // Create a progress bar element
      const progressBar = document.createElement('div');
      progressBar.classList.add('carousel-progress-bar');
      progressBar.dataset.currentSlide = '1';
      progressBar.dataset.totalSlides = rows.length.toString();
      
      // Create the active progress indicator
      const progressIndicator = document.createElement('div');
      progressIndicator.classList.add('progress-indicator');
      progressBar.appendChild(progressIndicator);
      
      // Create a container for the counter
      const counterContainer = document.createElement('div');
      counterContainer.classList.add('carousel-counter');
      counterContainer.dataset.currentSlide = '1';
      counterContainer.dataset.totalSlides = rows.length.toString();
      
      // Add progress bar, counter and navigation buttons to the navigation row
      navigationRow.append(progressBar);
      navigationRow.append(counterContainer);
      navigationRow.append(slideNavButtons);
      
      // Add the navigation row after the preview thumbnails
      block.append(navigationRow);
    } else {
      container.append(slideNavButtons);
      block.append(slideIndicatorsNav);
    }
  }

  // Store slides for later use with previews
  const createdSlides = [];
  
  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);
    createdSlides.push(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });
  
  // Create slide previews if it's a numbered variant
  if (block.classList.contains('numbered')) {
    const slidePreviews = block.querySelector('.slide-previews');
    
    createdSlides.forEach((slide, idx) => {
      // Find the image in the slide
      const slideImage = slide.querySelector('.carousel-slide-image img');
      if (slideImage) {
        const preview = document.createElement('li');
        preview.classList.add('slide-preview');
        if (idx === 0) preview.classList.add('active');
        preview.dataset.targetSlide = idx;
        
        // Create a thumbnail image
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = slideImage.src;
        thumbnailImg.alt = '';
        preview.appendChild(thumbnailImg);
        
        // Add click event to navigate to the slide
        preview.addEventListener('click', () => {
          showSlide(block, idx);
        });
        
        slidePreviews.appendChild(preview);
      }
    });
  }

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
