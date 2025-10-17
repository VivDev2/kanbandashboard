
import HeroSection from './HeroSection'
import Navigation from './Navigation'
import BentoGrid from './BentoGrid'
import FeaturesSection from './FeaturesSection'
import ProjectTimeline from './ProjectTimeline'
import CTASection from './CTASection'
import Footer from './Footer'

const LandingPage = () => {
  return (
    <div>
      <Navigation/>
      <HeroSection/>
      <BentoGrid />
      <FeaturesSection />
      <ProjectTimeline />
      <CTASection />
      <Footer/>
      
    </div>
  )
}

export default LandingPage
