import { NextResponse } from 'next/server';
import { getAllQuestions } from '@/lib/questions';

export async function GET() {
  try {
    const questions = await getAllQuestions();
    return NextResponse.json(questions);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
