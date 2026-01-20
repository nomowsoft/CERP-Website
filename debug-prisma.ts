import prisma from './src/utils/db';

async function test() {
    try {
        console.log('User fields:', Object.keys((prisma as any)._dmmf.modelMap.User.fields));
    } catch (e) {
        console.error('Error checking DMMF:', e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
