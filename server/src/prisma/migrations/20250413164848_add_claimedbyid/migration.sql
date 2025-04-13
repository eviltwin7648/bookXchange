-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "claimedById" TEXT;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
