$(document).ready(function(){

gsap.to('.myHandText', {scrollTrigger:{
    trigger: '.myHand',
    start: "top 90%",
    end: "bottom 90%",
    scrub: 1,
    }, duration: 3, x: "-15%", ease: 'linear'});
gsap.from('.card', {scrollTrigger: {
    trigger: '.myHand',
    start: '20% 60%',
    end: '55% 50%',
    scrub: true,
}, duration: 3, opacity: 0, y: "50%", ease: "ease-in"})
// card animations
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
  
  

  });