
(function($) {

	var	$window = $(window),
		$body = $('body');

	// Breakpoints
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Touch
		if (browser.mobile)
			$body.addClass('is-touch');

	// Forms
		var $form = $('form');

		// Auto-resizing textareas
			$form.find('textarea').each(function() {

				var $this = $(this),
					$wrapper = $('<div class="textarea-wrapper"></div>'),
					$submits = $this.find('input[type="submit"]');

				$this
					.wrap($wrapper)
					.attr('rows', 1)
					.css('overflow', 'hidden')
					.css('resize', 'none')
					.on('keydown', function(event) {

						if (event.keyCode == 13
						&&	event.ctrlKey) {

							event.preventDefault();
							event.stopPropagation();

							$(this).blur();

						}

					})
					.on('blur focus', function() {
						$this.val($.trim($this.val()));
					})
					.on('input blur focus --init', function() {

						$wrapper
							.css('height', $this.height());

						$this
							.css('height', 'auto')
							.css('height', $this.prop('scrollHeight') + 'px');

					})
					.on('keyup', function(event) {

						if (event.keyCode == 9)
							$this
								.select();

					})
					.triggerHandler('--init');

				// Fix.
					if (browser.name == 'ie'
					||	browser.mobile)
						$this
							.css('max-height', '10em')
							.css('overflow-y', 'auto');

			});

		

	// Menu
		var $menu = $('#menu');

		$menu.wrapInner('<div class="inner"></div>');

		$menu._locked = false;

		$menu._lock = function() {

			if ($menu._locked)
				return false;

			$menu._locked = true;

			window.setTimeout(function() {
				$menu._locked = false;
			}, 350);

			return true;

		};

		$menu._show = function() {

			if ($menu._lock())
				$body.addClass('is-menu-visible');

		};

		$menu._hide = function() {

			if ($menu._lock())
				$body.removeClass('is-menu-visible');

		};

		$menu._toggle = function() {

			if ($menu._lock())
				$body.toggleClass('is-menu-visible');

		};

		$menu
			.appendTo($body)
			.on('click', function(event) {
				event.stopPropagation();
			})
			.on('click', 'a', function(event) {

				var href = $(this).attr('href');

				event.preventDefault();
				event.stopPropagation();

				// Hide.
					$menu._hide();

				// Redirect.
					if (href == '#menu')
						return;

					window.setTimeout(function() {
						window.location.href = href;
					}, 350);

			})
			.append('<a class="close" href="#menu">Close</a>');

		$body
			.on('click', 'a[href="#menu"]', function(event) {

				event.stopPropagation();
				event.preventDefault();

				// Toggle.
					$menu._toggle();

			})
			.on('click', function(event) {

				// Hide.
					$menu._hide();

			})
			.on('keydown', function(event) {

				// Hide on escape.
					if (event.keyCode == 27)
						$menu._hide();

			});

})(jQuery);

//slideshow
document.querySelectorAll('[data-slideshow]').forEach(function (slideshow) {
	var track = slideshow.querySelector('[data-slide-track]');
	var slides = slideshow.querySelectorAll('.slide');
	var status = slideshow.querySelector('[data-slide-status]');
	var prev = slideshow.querySelector('[data-slide-prev]');
	var next = slideshow.querySelector('[data-slide-next]');
	var index = 0;
	var autoplayDelay = parseInt(slideshow.getAttribute('data-autoplay'), 10);
	var autoplayTimer = null;

	function renderSlide() {
		track.style.transform = 'translateX(' + (index * -100) + '%)';
		status.textContent = (index + 1) + ' / ' + slides.length;
	}

	function showNextSlide() {
		index = (index + 1) % slides.length;
		renderSlide();
	}

	function stopAutoplay() {
		if (autoplayTimer) {
			window.clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
	}

	function startAutoplay() {
		if (!autoplayDelay || slides.length < 2) {
			return;
		}

		stopAutoplay();
		autoplayTimer = window.setInterval(showNextSlide, autoplayDelay);
	}

	prev.addEventListener('click', function () {
		index = (index - 1 + slides.length) % slides.length;
		renderSlide();
		startAutoplay();
	});

	next.addEventListener('click', function () {
		showNextSlide();
		startAutoplay();
	});

	slideshow.addEventListener('mouseenter', stopAutoplay);
	slideshow.addEventListener('mouseleave', startAutoplay);
	slideshow.addEventListener('focusin', stopAutoplay);
	slideshow.addEventListener('focusout', startAutoplay);

	renderSlide();
	startAutoplay();
});

//grid
function renderGrid(container, items) {
  if (!container) {
    throw new Error("Grid container not found.");
  }

  const figures = items.map(({ src, alt, caption, span = 6 }) => {
    const figure = document.createElement("figure");
    figure.style.setProperty("--span", span);

    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    img.decoding = "async";

    figure.append(img);

    if (caption) {
      const text = document.createElement("figcaption");
      text.textContent = caption;
      figure.append(text);
    }

    return figure;
  });

  container.replaceChildren(...figures);
}

const caseStudyDataUrl = new URL("../data/", document.currentScript.src);

async function loadCaseStudy(projectId) {
  const projectUrl = new URL(`${encodeURIComponent(projectId)}.json`, caseStudyDataUrl);
  const response = await fetch(projectUrl);

  if (!response.ok) {
    throw new Error(`Could not load project data: ${response.status}`);
  }

  const project = await response.json();

  project.sections.forEach((sectionData) => {
    const section = document.getElementById(sectionData.id);

    if (!section || !section.classList.contains("case-study-section")) {
      console.warn(`Case study section not found: ${sectionData.id}`);
      return;
    }

    const heading = document.createElement("h2");
    heading.textContent = sectionData.title;
    section.replaceChildren(heading);

    if (sectionData.description) {
      const description = document.createElement("p");
      description.textContent = sectionData.description;
      section.append(description);
    }

    const grid = document.createElement("div");
    grid.className = "image-grid";
    section.append(grid);
    renderGrid(grid, sectionData.images);
  });
}

const projectId = document.body.dataset.project;

if (projectId) {
  loadCaseStudy(projectId).catch((error) => {
    console.error(error);
    document.querySelectorAll(".case-study-section").forEach((section) => {
      section.textContent = "This section could not be loaded.";
    });
  });
}

//about
(function () {
	var blocks = Array.from(document.querySelectorAll('.about-block'));
	var framePending = false;

	if (!blocks.length) return;

	function updateFocus() {
		var midpoint = window.innerHeight / 2;
		var nearest = blocks[0];
		var nearestDistance = Infinity;

		blocks.forEach(function (block) {
			var bounds = block.getBoundingClientRect();
			var distance = Math.abs(bounds.top + bounds.height / 2 - midpoint);

			if (distance < nearestDistance) {
				nearest = block;
				nearestDistance = distance;
			}
		});

		blocks.forEach(function (block) {
			block.classList.toggle('is-active', block === nearest);
		});
		document.documentElement.classList.add('about-focus-ready');
		framePending = false;
	}

	function scheduleUpdate() {
		if (framePending) return;
		framePending = true;
		window.requestAnimationFrame(updateFocus);
	}

	window.addEventListener('scroll', scheduleUpdate, { passive: true });
	window.addEventListener('resize', scheduleUpdate);
	window.addEventListener('pageshow', scheduleUpdate);
	if (document.fonts) document.fonts.ready.then(scheduleUpdate);
	updateFocus();
})();
