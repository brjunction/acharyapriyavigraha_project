import { Suspense } from "react";
import { SearchResults } from "@/components/search-page/results";

export const metadata = { title: "Search", description: "Search the lectures, books, articles, quotes, diary and life of Śrī Śrīmad Gour Govinda Swāmī Gurudeva." };

export default function SearchPage() { return <Suspense><SearchResults /></Suspense>; }
