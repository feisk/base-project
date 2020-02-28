function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function(){
  setMobileMenu();
  setModalShow();
});

const preventWindowScroll = (e, scrollPos) => {
    e.preventDefault();
    e.stopPropagation();
    window.scrollTo(0, scrollPos);
};

const setMobileMenu = () => {
  const body = $('body');
  const header = $('header.header');
  const mobileMenuButton = header.find('.header__menu-mobile-button');
  const headerNavLink = header.find('.header__nav-link');
  const headerDownloadButton = header.find('.button[scroll-to = download-anchor]');
  const bodyNoScrollClassName = 'no-scroll';
  const menuOpenHeaderClassName = 'header--menu-mobile-open';
  const menuOpenButtonClassName = 'header__menu-mobile-button--is-open';

  const toggleMenu = () => {
    const currentScrollPos = window.scrollY;

    $(body).toggleClass(bodyNoScrollClassName);
    $(header).toggleClass(menuOpenHeaderClassName);
    $(mobileMenuButton).toggleClass(menuOpenButtonClassName);

    if ($(header).hasClass(menuOpenHeaderClassName)) {
      $(window).on('scroll', e => preventWindowScroll(e, currentScrollPos));
      $(headerNavLink).on('click', toggleMenu);
      $(headerDownloadButton).on('click', toggleMenu);
    } else {
      $(window).off('scroll');
      $(headerNavLink).off('click', toggleMenu);
      $(headerDownloadButton).off('click', toggleMenu);
    }
  };

  $(mobileMenuButton).on('click', toggleMenu);
};

const setModalShow = () => {
  const modalOpenButton = $('#modalOpenButton');
  const modal = $('#modal');
  const modalCloseButton = $(modal).find('.modal__button-close');
  const body = $('body');
  const header = $('header.header');

  const modalOpeningClassName = 'modal--opening';
  const modalShowClassName = 'modal--show';
  const bodyOverlayClassName = 'overlay';
  const bodyNoScrollClassName = 'no-scroll';

  const openModal = () => {
    const clientWidth = document.documentElement.clientWidth;
    const currentScrollPos = window.scrollY;

    $(window).on('scroll', e => preventWindowScroll(e, currentScrollPos));
    $(header).width(clientWidth);
    $(body).width(clientWidth).addClass(`${bodyOverlayClassName} ${bodyNoScrollClassName}`).on('keyup', (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) closeModal();
    });
    $(modal).addClass(modalOpeningClassName);

    setTimeout(() => {
      $(modal).addClass(modalShowClassName);
      $(modalCloseButton).focus();
    }, 30);
  };

  const closeModal = () => {
    $(window).off('scroll');
    $(header).width('100%');
    $(body).width('100%').off('keyup').removeClass(`${bodyOverlayClassName} ${bodyNoScrollClassName}`);
    $(modal).removeClass(`${modalShowClassName} ${modalOpeningClassName}`);
  };

  modalOpenButton.on('click', openModal);
  modalCloseButton.on('click', closeModal);
};