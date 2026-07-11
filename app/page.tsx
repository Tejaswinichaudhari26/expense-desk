import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";//
import {z} from "zod";

const prisma = new PrismaClient();

const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount 0 पेक्षा जास्त असावी"),
  category: z.string().min(1, "Category आवश्यक आहे"),
  description: z.string().min(3, "Description किमान ३ अक्षरांचे असावे"),
});

async function createExpense(formData: FormData) {
  "use server";
  const rawData = {
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description"),
  };

  const result = expenseSchema.safeParse(rawData);
  if (!result.success) return;

  await prisma.expense.create({
    data: result.data,
  });
  revalidatePath('/');
}

async function deleteExpense(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;

  await prisma.expense.delete({
    where: { id },
  });

  revalidatePath('/');
}
export default async function Home() {
  // डेटाबेस मधून सर्व खर्च मिळवा
  const expenses = await prisma.expense.findMany();

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>ExpenseDesk</h1>
      {/* फॉर्म */}
      <form action={createExpense} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', marginBottom: '40px' }}>
        <input name="amount" type="number" placeholder="Amount" style={{ padding: '10px' }} required />
        <input name="category" type="text" placeholder="Category" style={{ padding: '10px' }} required />
        <input name="description" type="text" placeholder="Description" style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}>
          Add Expense
        </button>
      </form>

      {/* डेटा दाखवण्यासाठी टेबल */}
      <h2>My Expenses</h2>
     <table border={1} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
        <tr>
          <th style={{ padding: '10px', textAlign: 'left' }}>Amount</th>
          <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
          <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
          <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
       </tr>
      </thead>
      <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td style={{ padding: '10px' }}>{expense.amount}</td>
              <td style={{ padding: '10px' }}>{expense.category}</td>
              <td style={{ padding: '10px' }}>{expense.description}</td>
              <td style={{ padding: '10px' }}>
          {/* डिलीट बटण वाला फॉर्म */}
          <form action={deleteExpense}>
            <input type="hidden" name="id" value={expense.id} />
            <button type="submit" style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>Delete</button>
          </form>
        </td>
        </tr>
      ))}
     </tbody>
    </table>
  </main>
  );
}