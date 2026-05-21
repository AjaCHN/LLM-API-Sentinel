// app/api/check/route.ts v2.5.0
import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ApiCheckResult } from '../../types';

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'api_status'));
    const results: ApiCheckResult[] = [];
    
    snapshot.forEach(doc => {
      results.push(doc.data() as ApiCheckResult);
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch API status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API status' },
      { status: 500 }
    );
  }
}
