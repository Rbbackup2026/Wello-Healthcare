"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaPhone,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { toApiUrl } from "../../utils/api";
import { extractApiArray } from "../../utils/cityApi";
import {
  isPopularOrFullBodyProduct,
  isProductActive,
} from "../../utils/productVisibility";
import SupportLeadPopup from "./SupportLeadPopup";

const popularTests = [
  "CBC Test", "D Dimer Test", "ESR Test", "HbA1c Test", "Widal Test",
  "Lipid Profile Test", "KFT Test", "LFT Test", "Thyroid Test", "TSH Test",
  "Double Marker Test", "Ferritin Test", "RBS Test", "Trop i Test", "FBS Test",
  "ANA Test", "Antimullerian Hormone Test", "Beta HCG Test", "Creatinine Test",
  "HCV Test", "HIV Test", "Prolactin Test", "Uric Acid Test",
  "Prothrombin Time Test INR", "Urine Culture Test", "Typhoid Test",
  "Renal Function Test", "APTT Test", "TLC Test", "C Reactive Protein test",
  "Anti CCP Test", "Bone Marrow Test", "CA 125 Test", "Cholesterol Test",
  "Torch Test", "PPBS Test", "NT Probnp Test", "Selenium Test", "Weil Felix Test",
  "Bilirubin Test", "Blood Culture Test", "Quadruple Marker Test", "Amylase Test",
  "Homocysteine Test", "PCOD test", "Vitamin D Test", "C Peptide test",
  "DLC Test", "Haemoglobin Test", "STD Test", "Typhidot Test",
  "Urine Albumin Test", "Viral Marker Test", "Vitamin B12 Test",
  "RT-PCR Test in Gurgaon", "RT-PCR Test in Noida", "RT-PCR Test in Delhi",
  "RT-PCR Test in Dehradun", "RT-PCR Test in Chandigarh", "RT-PCR Test in Mumbai",
];

const locations = [
  "Lab Test in Delhi", "Lab Test in Gurgaon", "Lab Test in Ghaziabad",
  "Lab Test in Noida", "Lab Test in Pune", "Lab Test in Mumbai",
  "Lab Test in Bengaluru", "Lab Test in Faridabad", "Lab Test in Mohali",
  "Lab Test in Jodhpur", "Lab Test in Dehradun", "Lab Test in Udaipur",
  "Lab Test in Jaipur", "Lab Test in Ahmedabad", "Lab Test in Hyderabad",
  "Lab Test in Chennai", "Lab Test in Khanna", "Lab Test in Sirsa",
  "Lab Test in Kolkata", "Lab Test in Hoshiarpur",
];

const checkups = [
  "Full Body Checkup in Delhi", "Full Body Checkup in Gurgaon",
  "Full Body Checkup in Ghaziabad", "Full Body Checkup in Noida",
  "Full Body Checkup in Pune", "Full Body Checkup in Mumbai",
  "Full Body Checkup in Bengaluru", "Full Body Checkup in Faridabad",
  "Full Body Checkup in Mohali", "Full Body Checkup in Jodhpur",
  "Full Body Checkup in Dehradun", "Full Body Checkup in Udaipur",
  "Full Body Checkup in Jaipur", "Full Body Checkup in Ahmedabad",
  "Full Body Checkup in Hyderabad", "Full Body Checkup in Chennai",
];

const quickLinks = [
  "Find Our Lab", "Book A Test", "Health Packages", "Business",
  "Speciality Test", "Women Health Test", "Organ Test", "Contact Us",
  "About Us", "Annual Return", "Blog", "Diseases", "Symptoms", "Diet Plan",
  "Procedure Preparations", "Calculators", "BMI Calculator", "Pregnancy",
  "Lifestyle Disease", "Forum", "Privacy Policy", "Disclaimer",
  "Terms & Conditions", "Download Max Lab App", "Sitemap",
];

// ✅ Reusable component for row links
function LinkRow({ items, type = "query" }) {
  const getHref = (txt) => {
    if (type === "link") {
      const slug = txt.toLowerCase().trim();
      if (slug === "blog" || slug === "blogs") return "/blogs";
      return "/lab-tests";
    }

    return `/lab-tests?${type}=${encodeURIComponent(txt.replace("Lab Test in ", ""))}`;
  };

  return (
    <div className="flex flex-wrap items-center text-sm md:text-base gap-x-2 gap-y-2">
      {items.map((txt, idx) => (
        <span key={idx} className="inline-flex items-center whitespace-nowrap">
          <Link
            href={getHref(txt)}
            className="hover:underline truncate cursor-pointer text-white"
            title={txt}
            onClick={() => window.scrollTo(0, 0)}
          >
            {txt}
          </Link>
          {idx !== items.length - 1 && (
            <span className="mx-3 select-none text-white/60">|</span>
          )}
        </span>
      ))}
    </div>
  );
}

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [popularHealthCheckups, setPopularHealthCheckups] = useState([]);

  // ✅ State for only these two specific sections
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(toApiUrl("/categories")),
          axios.get(toApiUrl("/get_product")),
        ]);

        setCategories(catRes.data.filter((cat) => cat.status === true));

        const allProducts = extractApiArray(prodRes.data);
        const filtered = allProducts.filter(
          (product) =>
            isPopularOrFullBodyProduct(product) && isProductActive(product)
        );
        setPopularHealthCheckups(filtered);
      } catch (err) {
        console.error("Failed to fetch data for footer:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <footer className="text-white bg-black">
      {/* 🔹 Top Section */}
      <div className=" px-4 md:px-10 py-10 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Logo + Social */}
          <div className="flex items-center gap-2">
            <img src="/images/Wello logo.png" alt="Wello logo" className="w-24 h-auto cursor-pointer" />
            <span className="font-bold text-lg">Follow Us On</span>
            <div className="flex gap-3 ml-2 text-lg cursor-pointer">
              <FaFacebookF />
              <FaTwitter />
              <FaLinkedinIn />
              <FaInstagram />
            </div>
          </div>

          {/* App Store Links */}
          <div className="flex gap-4">
            <div>
              <p className="font-semibold">Download Max Lab App</p>
              <div className="flex gap-2 mt-1">
                <img src="/images/appstore.png" alt="App Store" className="w-28 cursor-pointer" />
                <img src="/images/playstore.png" alt="Google Play" className="w-28 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Popular Tests - Static (हमेशा दिखेगा) */}
        <section className="mb-6">
          <h3 className="text-base font-semibold mb-2">Popular Tests</h3>
          <LinkRow items={popularTests} type="query" />
        </section>

        {/* Divider */}
        <hr className="border-t border-white/20 my-6" />

        {/* Popular Categories */}
        <section className="mb-6">
          <h3 className="text-base font-semibold mb-2">Popular Categories</h3>
          <div className="flex flex-wrap items-center text-sm md:text-base gap-x-2 gap-y-2">
            {categories.map((cat, idx) => (
              <span key={cat._id} className="inline-flex items-center whitespace-nowrap">
                <Link
                  href={`/lab-tests?category=${encodeURIComponent(cat.name)}`}
                  className="hover:underline truncate cursor-pointer text-white"
                  title={cat.name}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  {cat.name}
                </Link>
                {idx !== categories.length - 1 && (
                  <span className="mx-3 select-none text-white/60">|</span>
                )}
              </span>
            ))}
          </div>
        </section>

        {/* Divider */}
        <hr className="border-t border-white/20 my-6" />

        {/* Popular Health Checkups (New Dynamic Section) */}
        <section className="mb-6">
          <h3 className="text-base font-semibold mb-2">Popular Health Checkup</h3>
          <div className="flex flex-wrap items-center text-sm md:text-base gap-x-2 gap-y-2">
            {popularHealthCheckups.map((test, idx) => (
              <span key={test._id} className="inline-flex items-center whitespace-nowrap">
                <Link
                  href={`/product/${test._id}`}
                  className="hover:underline truncate cursor-pointer text-white"
                  title={test.name}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  {test.name}
                </Link>
                {idx !== popularHealthCheckups.length - 1 && (
                  <span className="mx-3 select-none text-white/60">|</span>
                )}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* 🔹 Dark Blue Section */}
      <div className="bg-black ">
        <div className="px-10 mx-auto ">
          {/* Locations */}
          <section className="mb-8"> {/* Static */}
            <h3 className="text-lg md:text-xl font-semibold mb-3 relative inline-block">
              Location
              <span className="block absolute left-0 -bottom-1 w-full h-[1px] bg-white/20"></span>
            </h3>
            <LinkRow items={locations} type="city" />
          </section>

          {/* Checkups */}
          <section className="mb-8"> {/* Static */}
            <h3 className="text-lg md:text-xl font-semibold mb-3 relative inline-block">
              Full Body Checkup
              <span className="block absolute left-0 -bottom-1 w-full h-[1px] bg-white/20"></span>
            </h3>
            <LinkRow items={checkups} type="category" />
          </section>

          {/* Quick Links */}
          <section className="mb-6">
            <h3 className="text-lg md:text-xl font-semibold mb-3 relative inline-block">
              Quick Links
              <span className="block absolute left-0 -bottom-1 w-full h-[1px] bg-white/20"></span>
            </h3>
            <LinkRow items={quickLinks} type="link" />
          </section>

          {/* Divider */}
          <div className="border-t border-white/30 my-6"></div>

          {/* Bottom Info Row */}
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left text-sm space-y-4 md:space-y-0">
            <p>© 25 Wello Lab. All rights reserved</p>
            <p className="opacity-80">
              Wello Lab Limited (a wholly owned subsidiary of Max Healthcare Institute Limited)
            </p>
            <img
              src="/images/Wello logo.png"
              alt="Max Healthcare Logo"
              className="h-8 cursor-pointer mb-5"
            />
          </div>
        </div>
      </div>

      {/* 🔹 CTA Bar */}
      <div className="bg-white  py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-3">
          <p className="text-black font-medium">
            Get a Call Back from our Health Advisor
          </p>
          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="flex items-center gap-2 bg-[#0d2d5a] text-white px-4 py-2 rounded-md shadow hover:bg-[#0a2040] transition cursor-pointer"
          >
            <FaPhone />
            Call me now
          </button>
        </div>
      </div>

      <SupportLeadPopup open={supportOpen} onClose={() => setSupportOpen(false)} />
    </footer>
  );
}
