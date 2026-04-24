import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const testimonials = [
  {
    name: "Carlos Eduardo",
    city: "Porto Velho/RO",
    event: "TOP Destemidos Pioneiros",
    quote: "O TOP mudou completamente minha perspectiva como homem, pai e marido. Foram 72 horas que transformaram 40 anos de vida. Voltei para casa um homem diferente, mais presente e mais forte espiritualmente.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Marcos Antônio",
    city: "Balneário Camboriú/SC",
    event: "TOP Vale Europeu",
    quote: "Participar do TOP foi a decisão mais corajosa que já tomei. Na trilha, descobri que meus maiores obstáculos estavam dentro de mim. Hoje sou um Legendário e levo essa transformação para minha família todos os dias.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Rafael Mendes",
    city: "Porto Velho/RO",
    event: "TOP Destemidos Pioneiros",
    quote: "Cheguei ao TOP achando que era só uma trilha. Saí entendendo que era uma jornada de volta para Deus e para minha família. O Track Destemidos Pioneiros é uma experiência que todo homem deveria viver.",
    rating: 5,
    featured: 1,
  },
  {
    name: "André Luiz",
    city: "Curitiba/PR",
    event: "TOP Curitiba",
    quote: "Depois do TOP, meu casamento foi restaurado, minha relação com meus filhos se fortaleceu e encontrei um propósito que vai além de mim mesmo. Sou eternamente grato ao Movimento Legendários.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Paulo Roberto",
    city: "Belo Horizonte/MG",
    event: "TOP Minas Gerais",
    quote: "A experiência do TOP é indescritível. Você entra como um homem comum e sai como um guerreiro de Deus. A irmandade que se forma ali é para a vida toda. Recomendo a todo homem que busca ser melhor.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Fernando Costa",
    city: "Porto Velho/RO",
    event: "TOP Destemidos Pioneiros",
    quote: "Porto Velho é terra de pioneiros, e o TOP nos ensina a ser pioneiros na nossa própria transformação. Cada desafio na trilha é uma metáfora da vida. Saí de lá sabendo que posso enfrentar qualquer coisa.",
    rating: 5,
    featured: 1,
  },
];

async function seed() {
  try {
    await db.execute({
      sql: "INSERT INTO testimonials (name, city, event, quote, rating, featured) VALUES (?, ?, ?, ?, ?, ?)",
      params: [],
    });
  } catch(e) {}

  for (const t of testimonials) {
    await db.execute({
      sql: `INSERT INTO testimonials (name, city, event, quote, rating, featured) VALUES ('${t.name.replace(/'/g, "\\'")}', '${t.city}', '${t.event}', '${t.quote.replace(/'/g, "\\'")}', ${t.rating}, ${t.featured})`,
      params: [],
    });
    console.log(`Inserted: ${t.name}`);
  }
  console.log("Seed complete!");
  process.exit(0);
}

seed();
