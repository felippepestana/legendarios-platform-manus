/**
 * Seed script para depoimentos iniciais do TOP Destemidos Pioneiros
 * 
 * Uso: node scripts/seed-testimonials.mjs
 * 
 * Este script insere 6 depoimentos de exemplo no banco de dados.
 * Pode ser executado múltiplas vezes com segurança (usa INSERT IGNORE).
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não configurada. Defina no .env ou variáveis de ambiente.");
  process.exit(1);
}

const testimonials = [
  {
    name: "Carlos Eduardo",
    city: "Porto Velho/RO",
    event: "TOP Destemidos Pioneiros",
    quote:
      "O TOP mudou completamente minha perspectiva como homem, pai e marido. Foram 72 horas que transformaram 40 anos de vida. Voltei para casa um homem diferente, mais presente e mais forte espiritualmente.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Marcos Antônio",
    city: "Balneário Camboriú/SC",
    event: "TOP Vale Europeu",
    quote:
      "Participar do TOP foi a decisão mais corajosa que já tomei. Na trilha, descobri que meus maiores obstáculos estavam dentro de mim. Hoje sou um Legendário com orgulho.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Rafael Mendes",
    city: "Porto Velho/RO",
    event: "TOP Destemidos Pioneiros",
    quote:
      "Cheguei ao TOP achando que era só uma trilha. Saí entendendo que era uma jornada de volta para Deus e para minha família. O Track Destemidos Pioneiros mudou minha vida.",
    rating: 5,
    featured: 1,
  },
  {
    name: "André Luiz",
    city: "Curitiba/PR",
    event: "TOP Curitiba",
    quote:
      "Depois do TOP, meu casamento foi restaurado, minha relação com meus filhos se fortaleceu e encontrei um propósito que vai além de mim mesmo. Sou eternamente grato ao Movimento Legendários.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Paulo Roberto",
    city: "Belo Horizonte/MG",
    event: "TOP Belo Horizonte",
    quote:
      "A experiência do TOP é indescritível. Você entra como um homem comum e sai como um guerreiro de Deus. A irmandade que se forma ali é para a vida toda. Recomendo a todo homem que busca transformação.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Fernando Costa",
    city: "Porto Velho/RO",
    event: "TOP Destemidos Pioneiros",
    quote:
      "Porto Velho é terra de pioneiros, e o TOP nos ensina a ser pioneiros na nossa própria transformação. Cada desafio na trilha é uma metáfora da vida. Saí de lá um homem novo.",
    rating: 5,
    featured: 1,
  },
];

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    console.log("Conectado ao banco de dados.");

    for (const t of testimonials) {
      await connection.execute(
        `INSERT IGNORE INTO testimonials (name, city, event, quote, rating, featured) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [t.name, t.city, t.event, t.quote, t.rating, t.featured]
      );
      console.log(`  ✓ Depoimento de ${t.name} inserido.`);
    }

    const [rows] = await connection.execute("SELECT COUNT(*) as total FROM testimonials");
    console.log(`\nTotal de depoimentos no banco: ${rows[0].total}`);
    console.log("Seed concluído com sucesso!");
  } catch (error) {
    console.error("Erro ao executar seed:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
