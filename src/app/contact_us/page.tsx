"use client";
import 'aos/dist/aos.css';
import { useEffect } from "react";
import AOS from 'aos';
import Contactus from './contact_us';


export default function Contact() {
  useEffect(() => {
      AOS.init({
        duration: 1000,
        once: true,
      });
    }, []);
  return (
    <div>
        <Contactus />
    </div>
  );
}
