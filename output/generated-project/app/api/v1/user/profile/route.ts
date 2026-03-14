import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileUpdateSchema } from '@/lib/validations';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    const updatedFields: string[] = [];
    const updateData: any = {};

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
      updatedFields.push('name');
    }

    if (validatedData.fitnessLevel !== undefined) {
      updateData.fitnessLevel = validatedData.fitnessLevel;
      updatedFields.push('fitnessLevel');
    }

    if (validatedData.goals !== undefined) {
      updateData.goals = validatedData.goals;
      updatedFields.push('goals');
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        fitnessLevel: true,
        goals: true,
        emailVerified: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user,
      updated: updatedFields,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
