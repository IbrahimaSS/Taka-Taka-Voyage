import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function PublicProviders() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 60,
      easing: 'ease-out-cubic',
    });
  }, []);

  return <Outlet />;
}
