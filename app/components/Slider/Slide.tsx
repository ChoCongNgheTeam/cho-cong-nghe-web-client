"use client";
import { SlideProps } from "./types";

export default function Slide({ children, className = "" }: SlideProps) {
   return <div className={`slidezy-slide ${className}`}>{children}</div>;
}
