"use client";
import 'aos/dist/aos.css';
import { useEffect } from "react";
import AOS from 'aos';
import Slider from './Home/slider/slider';
import Features from './Home/features/features';
import Program from './Home/program_cerp/program_cerp';
import System from './Home/system/system';


export default function Home() {
  useEffect(() => {
      AOS.init({
        duration: 1000,
        once: true,
      });
    }, []);
  return (
    <div className="bg-gray-100">
      <Slider />
      <Features />
      <Program />
      <System />
    </div>
  );
}
