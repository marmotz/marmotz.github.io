'use strict';

var notepad = (function ($) {
    var indexPostClass        = '.notepad-index-post';
    var mobileMenuButton      = '.notepad-mobile-menu a';
    var mobileMenuCloseButton = '.notepad-mobile-close-btn';
    var mainMenu              = '.notepad-menu';
    var bgCheckClass          = '.bg-check';
    var postBgImages          = '.bg-img img';
    var postCoverImg          = '.notepad-post-header .bg-img';

    // post animations on homepage
    var indexPostAnimate = function () {
        if ($(indexPostClass).length) {
            $(indexPostClass).each(function () {
            var postPos = $(this).css('visibility', 'hidden').offset().top;
            var topOfWindow = $(window).scrollTop(),
                windowHeight = $(window).height();
                if (postPos < topOfWindow + (windowHeight/ 1.4)) {
                    $(this).addClass('fadeInDown');
                }
            });
        }
    };

    var mobileMenu = function () {
        if($(mainMenu).length) {
            $(mobileMenuButton).on('click', function(e){
                e.preventDefault();
                $(mainMenu).addClass('opened');
            });
            $(mobileMenuCloseButton).on('click', function(e){
                e.preventDefault();
                $(mainMenu).removeClass('opened');
            });
        }
    };

    var headerTitlesBackgroundCheck = function () {
        if ($(bgCheckClass).length && $(postBgImages).length) {
            BackgroundCheck.init({
                targets: bgCheckClass,
                images: postBgImages
            });
        }
    };

    var postHeaderCoverImg = function () {
        var coverImage = $('[alt=cover-image]');
        if (coverImage.length) {
            $(postCoverImg).append('<img src="' + coverImage.attr('src') + '">');
            coverImage.remove();
        }
    };

    // notepad javascripts initialization
    var init = function () {
        indexPostAnimate();
        $(window).on('scroll', function() {
            indexPostAnimate();
        });
        postHeaderCoverImg();
        mobileMenu();
        headerTitlesBackgroundCheck();
        $('p:has(> img)').addClass('with-image');
    };

    return {
        init: init
    };

})(jQuery);

(function () {
    notepad.init();
})();
