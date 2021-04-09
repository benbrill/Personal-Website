document.addEventListener("DOMContentLoaded", function() {

intro = gsap.timeline({repeat: -1, repeatDelay: 2, yoyo: true});
(window.innerWidth > 768) && intro.to('.menuItems a:link',{duration: 2, delay: 2.5, color: "white", ease:Power1.easeNone});
intro.to('#introDark',{duration: 2, opacity: "100%", ease: Power1.easeNone}, "-=2");
intro.to('#introNight',{duration: 2, opacity: "100%", ease: Bounce.easeOut});
intro.to('#introNight',{duration: 1.5});


// gsap.to('.otherStuffImage', {scrollTrigger: {
//     trigger:'.otherStuff',
//     start: "40% 50%",
//     end: "70% 30%",
//     pin: true,
//     scrub: 1,
// }, duration: 3, clipPath: "inset(0% 0%)"})




// card animations
if (window.innerWidth > 768) {
    var tl = gsap.timeline();

tl.from('.otherStuffImage',{duration: 2, clipPath: "inset(20% 10% 40% 10%)"});
tl.from('.otherStuffImageWipe, #wipeText',{duration: 3, clipPath: "inset(0% 100% 0% 0%)"})
tl.from('.otherStuffText .white', {duration: 3, clipPath: "inset(0% 100% 0% 0%)"})
tl.from('.otherStuffTextContainer', {duration: 2, opacity: 0, x: "50%"})

    ScrollTrigger.create({
        animation: tl,
        trigger:'.otherStuff',
            start: "60% 50%",
            end: "bottom top",
            pin: true,
            markers: false,
            scrub: 1,
    });
    gsap.to('.myHandText', {scrollTrigger:{
        trigger: '.myHand',
        start: "top 90%",
        end: "bottom 90%",
        scrub: 1,
        }, duration: 3, x: "-20%", ease: 'linear'});
    gsap.from('.card', {scrollTrigger: {
        trigger: '.myHand',
        start: '20% 60%',
        end: '55% 50%',
        scrub: true,
    }, duration: 3, opacity: 0, y: "50%", ease: "ease-in"})
  const card = document.querySelectorAll('.card');

  const role = document.querySelectorAll('.role')
  const place = document.querySelectorAll('.place')
  const description = document.querySelectorAll('.description')
  const cardInfo= document.querySelectorAll('.cardInfo')

  for (let i = 0; i < card.length; i++) {
    card[i].addEventListener("mousemove",(e) => {
        let widths = card[i].clientWidth
        let xAxis = ((widths / 2) - e.offsetX) / 50;
        let yAxis = (window.innerHeight / 2 - e.pageY) / 70;
        
        card[i].style.transform = `rotateY(${-xAxis}deg) rotateX(${yAxis}deg) `;
        
    });

    

    card[i].addEventListener('mouseenter', (e) => {
        card[i].style.transition = "none"
    
        place[i].style.transform = "translateZ(5vmax) translateY(-1vmax)"
        role[i].style.transform = "translateZ(3vmax) translateY(-1vmax)"
        // placeIcons[i].style.transform = "translateZ(5vmax)"
        description[i].style.transform = "translateZ(3vmax) translateY(-0.5vmax)"
      });
    
      card[i].addEventListener('mouseleave', (e) => {
          card[i].style.transform = `rotateY(0deg) rotateX(0deg)`;
          card[i].style.transition = "all 0.5s ease";
          description[i].style.transition ="all 0.5s ease";
          place[i].style.transition ="all 0.5s ease";
          role[i].style.transition ="all 0.5s ease";
          description[i].style.transform = "translateZ(0vmax) translateY(0vmax)"
          place[i].style.transform = "translateZ(0vmax) translateY(0vmax)"
          role[i].style.transform = "translateZ(0vmax) translateY(0vmax)"
      });
  }
}
  
  const navSlide = () => {
    const burger = document.querySelector('.burger')
    const nav = document.querySelector('.menuItems')

    burger.addEventListener('click', () => {
        nav.classList.toggle('navActive')
        burger
    })
}
navSlide()
  });