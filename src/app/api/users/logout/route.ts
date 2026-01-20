import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';


/**
 * @method GET
 * @route ~/api/users/logout
 * @desc Logout a user or account (sign out)
 * @access Public
 */

export async function GET(request: NextRequest) {
    try {
        (await cookies()).delete("jwtToken")
        return NextResponse.json({ message: "Logout successful" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
