import { Still } from 'remotion';
import { HeroStill } from './sections/Hero';
export const Root: React.FC = () => (
  <>
    <Still id="hero-16x9" component={HeroStill} width={1920} height={1080} />
    <Still id="hero-9x16" component={HeroStill} width={1080} height={1920} />
  </>
);
