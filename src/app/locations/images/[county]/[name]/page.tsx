'use client';

import ImageManager from "../../../../../components/ImageManager";
import { useParams } from "next/navigation";

export default function ImageManagerPage() {
  const { county, name } = useParams<{ county: string; name: string }>();


  return <ImageManager county={county} siteName={name} />;
}