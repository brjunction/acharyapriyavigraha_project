/* Words shared by both home designs: the founder’s steps and the services thanked. */
import { Mic, FileText, Languages, PenLine, Images, Code2 } from "lucide-react";

export const FOUNDER_STEPS: [string, string, string][] = [
  ["1992", "Joins ISKCON Bhubaneswar", "Comes into contact with the devotees at ISKCON Bhubaneswar and begins to join their service."],
  ["1994", "Initiation", "Initiated as Halāyudha Dāsa. Serves in the travelling saṅkīrtana party and as head pūjārī of Śrī Śrī Kṛṣṇa-Balarāma Temple."],
  ["2016", "Sannyāsa", "Accepts the renounced order on 20 March 2016, from His Holiness Rādhā-Govinda Swāmī Mahārāja, at Śrī Śrī Kṛṣṇa-Balarāma Temple."],
  ["2019", "The wish for one digital home", "During his European tour, at ISKCON New Māyāpura, he expressed his cherished desire to create a platform where all the audio lectures of his spiritual master would be available to everyone."],
  ["2020", "Small clips, every day", "With the help of his disciples and followers he began curating daily selections of quotes and lectures, turned into small audio clips that capture the essence of Gurudeva’s teachings."],
  ["Today", "Simple living, high thinking", "Emphasises serving the spiritual master (śrī guru-sevā) and chanting the holy names (śrī nāma-sevā) without compromise."],
];

export const THANKS: [React.ComponentType<{ size?: number; className?: string }>, string, string, string][] = [
  [Mic, "Recording", "Lectures and kīrtanas, recorded and kept for decades", "bg-[#fdecea] text-[#b3261e]"],
  [FileText, "Transcription", "Every word written down, checked and checked again", "bg-[#e8f0fe] text-[#1a56db]"],
  [Languages, "Translation", "Into Russian, Spanish, Odia, Hindi, Bengali and more", "bg-[#e6f4ea] text-[#137333]"],
  [PenLine, "Editing", "Books, articles and the diaries prepared for reading", "bg-[#fef7e0] text-[#b06000]"],
  [Images, "Photos & films", "Gathered from archives and devotees’ albums", "bg-[#f3e8fd] text-[#7627bb]"],
  [Code2, "Design & code", "This website, the WebFolio and the apps", "bg-[#e4f7fb] text-[#007b83]"],
];
