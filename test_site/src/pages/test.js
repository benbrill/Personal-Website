import React from 'react'
import '../../../style.css'

const test = () => {
    return (
        <div>
            ;<>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Ben-Ohr Brill</title>
  <link rel="stylesheet" href="https://use.typekit.net/mta3hot.css" />
  <link rel="shortcut icon" href="../../../Images/favicon.ico" type="image/x-icon" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.5.1/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.5.1/EasePack.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.5.1/ScrollTrigger.min.js"></script>
<script src="../../../app.js"></script>
  <div className="wraper">
    <nav className="menu">
      <div id="menuLogoContainer">
        <a href="..\index.html">
          <img
            src="../../../Images/logos_Thick Inverse White.svg"
            id="menuLogo"
            alt="The logo for the menu"
          />
        </a>
        <div className="burger">
          <div className="burgerLine" />
          <div className="burgerLine" />
          <div className="burgerLine" />
        </div>
      </div>
      <ul className="menuItems">
        <li>
          <a href="../Resume.pdf">Resume</a>
        </li>
        <li>
          <a href="..\data">Data</a>
        </li>
        <li>
          <a href="https://benohrbrill.com/design">Design</a>
        </li>
        <li>
          <a href="..\index.html#contact">Contact</a>
        </li>
      </ul>
    </nav>
    <div className="introBanner">
      <div className="imageContainer">
        <img
          src="../../../Images/JTree_Day_Mobile.jpg"
          className="introImages mobile"
          id="introDay"
          alt
        />
        <img
          src="../../../Images/JTree_Dark_Mobile.jpg"
          className="introImages mobile"
          id="introDark"
          alt
        />
        <img
          src="../../../Images/JTree_Night_Mobile.jpg"
          className="introImages mobile"
          id="introNight"
          alt
        />
      </div>
      <img
        src="../../../Images/JTree_Day.jpg"
        className="introImages desktop"
        id="introDay"
        alt
      />
      <img
        src="../../../Images/JTree_Dark.jpg"
        className="introImages desktop"
        id="introDark"
        alt
      />
      <img
        src="../../../Images/JTree_Night.png"
        className="introImages desktop"
        id="introNight"
        alt
      />
      <div className="introTextContainer">
        <div className="logo" />
        <div id="introNormal">
          My full name is Ben-Ohr, which means "Son of Light" in Hebrew!
        </div>
      </div>
    </div>
    <div className="myHand">
      <div className="myHandText">
        the basics <span className="myHandOther">the basics </span>
      </div>
      <div className="cardContainer">
        <div className="card">
          <div className="cardInfo">
            <span className="role">Student</span>
            <span className="place">UCLA</span>
            <img
              id="royce"
              className="placeIcon"
              src="../../../Images/Royce_Royce.svg"
              alt="Rand inspired Royce Hall at UCLA"
            />
            <div className="description">
              I am a second-year student studying{" "}
              <strong>
                Statistics and Cognitive Science with a specialization in
                computing.{" "}
              </strong>
              I’m also a campus tour guide, so ask me about Royce Hall, the
              building above!
            </div>
          </div>
        </div>
        <div className="card">
          <div className="cardInfo">
            <span className="role">Graphics editor</span>
            <span className="place">Daily Bruin</span>
            <img
              id="design"
              className="placeIcon"
              src="../../../Images/design-07.svg"
              alt="Rand inspired Computer designing things"
            />
            <div className="description">
              As Graphics editor, I create pitches and managage the design of
              graphics. Recently, we have put an emphasis on data visualization,
              finding and visualizing unique stories from data sets.
            </div>
          </div>
        </div>
        <div className="card">
          <div className="cardInfo">
            <span className="role">I like</span>
            <span className="place">Data</span>
            <img
              id="data"
              className="placeIcon"
              src="../../../Images/Data_Data.svg"
              alt="Rand inspired Royce Hall at UCLA"
            />
            <div className="description">
              Much of my focus in my studies is on data, whether it be data
              mining or psychological statistics. Recently, I’ve been doing more
              independent data projects to build up my skills. You can see some
              of those projects in the Data section.
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="otherStuff">
      <div className="otherStuffTitle mobile">Some other things I like</div>
      <img
        className="otherStuffImage"
        src="../../../Images/Dodger Stadium-3.jpg"
        alt="The 110 Freeway heading toward Downtown LA near Elysian Park"
      />
      <img
        className="otherStuffImageWipe"
        src="../../../Images/Dodger Stadium Night-1.jpg"
        alt="The 110 Freeway heading toward Downtown LA near Elysian Park at night"
      />
      <div className="otherStuffTitle desktop">Some other things I like</div>
      <div className="otherStuffTitle white desktop" id="wipeText">
        Some other things I like
      </div>
      <div className="otherStuffTextContainer">
        <div className="osLA">Los Angeles</div>
        <div className="osLAexplain">
          My home, and something I like to take pictures of. I like taking
          pictures in general.
        </div>
      </div>
    </div>
    {/* <div class="alsoLike">
  <h1>I also like</h1>
    </div> */}
    <section id="contact">
      <h2>Say hi!</h2>
      <div className="contactIcons">
        <div className="contactIconContainer">
          <img
            src="../../../Images/Email.svg"
            className="contactImage"
            alt="Icon for Email"
          />
          <div>Email</div>
        </div>
        <div className="contactIconContainer">
          <a
            href="https://www.linkedin.com/in/benohrbrill/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="../../../Images/LinkedIn.svg"
              className="contactImage"
              alt="Icon for LinkedIn"
            />
          </a>
          <div>LinkedIn</div>
        </div>
        <div className="contactIconContainer">
          <a
            href="https://github.com/benbrill"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="../../../Images/Github.svg"
              className="contactImage"
              alt="Icon for Github"
            />
          </a>
          <div>Github</div>
        </div>
        <div className="contactIconContainer">
          <a
            href="https://twitter.com/benzbrill"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="../../../Images/Twitter.svg"
              className="contactImage"
              alt="Icon for Twitter"
            />
          </a>
          <div>Twitter</div>
        </div>
      </div>
    </section>
  </div>
</>

        </div>
    )
}

export default test
