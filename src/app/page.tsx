"use client";
"use client";
import 'aos/dist/aos.css';
import { useEffect } from "react";
import AOS from 'aos';
import Hero from "./Home/hero/hero";
import Product from './Home/product/product';
import Slider from './Home/slider/slider';
import SystemHifz from './Home/system_hifz/system_hifz';
import SystemHealth from './Home/system_health/page';


export default function Home() {
  useEffect(() => {
      AOS.init({
        duration: 1000,
        once: true,
      });
    }, []);
  return (
    <div className="bg-slate-100">
      <Slider />
      <Hero />
      <Product />
      <SystemHifz />
      <SystemHealth />
    </div>
  );
}
