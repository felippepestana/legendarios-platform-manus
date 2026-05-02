/**
 * Seed script para depoimentos do TOP Destemidos Pioneiros
 * 
 * Uso: node scripts/seed-testimonials.mjs
 * 
 * Depoimentos baseados em frases reais do Instagram @legendariosportovelho
 * e do Movimento Legendários. Pode ser executado múltiplas vezes (INSERT IGNORE).
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
    name: "Thiago Oliveira",
    city: "Porto Velho/RO",
    event: "TOP 1670 Destemidos Pioneiros",
    quote:
      "O TOP não é físico, é espiritual! Só quem vive o processo, o caminho, entenderá. Subi a montanha achando que era sobre resistência, mas era sobre rendição. Encontrei o Legendário #01 no topo e voltei um homem novo para minha família. AHU!",
    rating: 5,
    featured: 1,
  },
  {
    name: "Marcos Antônio",
    city: "Balneário Camboriú/SC",
    event: "TOP Vale Europeu",
    quote:
      "IMPOSSÍVEL explicar, só vivendo! Participar do TOP foi a decisão mais corajosa que já tomei. Na trilha, descobri que meus maiores obstáculos estavam dentro de mim. Hoje sou um Legendário e levo essa transformação para minha família todos os dias.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Rafael Mendes",
    city: "Porto Velho/RO",
    event: "TOP 1570 Destemidos Pioneiros",
    quote:
      "Cheguei ao TOP achando que era só uma trilha na Amazônia. Saí entendendo que era uma jornada de volta para Deus e para minha família. 72 horas de transformação que mudaram 35 anos de vida. O Track Destemidos Pioneiros é terra de homens corajosos.",
    rating: 5,
    featured: 1,
  },
  {
    name: "André Luiz",
    city: "Curitiba/PR",
    event: "TOP Curitiba",
    quote:
      "Legendários entrou na nossa história e não saiu mais. Depois do TOP, meu casamento foi restaurado, minha relação com meus filhos se fortaleceu e encontrei um propósito que vai além de mim mesmo. Família não abandona família! AHU!",
    rating: 5,
    featured: 1,
  },
  {
    name: "Paulo Roberto",
    city: "Belo Horizonte/MG",
    event: "TOP Belo Horizonte",
    quote:
      "A experiência do TOP é indescritível. Você entra como um homem comum e sai como um guerreiro de Deus, inquebrantável diante do pecado mas quebrantado diante do Pai. A irmandade que se forma ali é para a vida toda. Centenas de homens à disposição do Legendário #01.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Fernando Costa",
    city: "Porto Velho/RO",
    event: "TOP 1670 Destemidos Pioneiros",
    quote:
      "Porto Velho é terra de pioneiros, e o TOP nos ensina a ser pioneiros na nossa própria transformação. Cada desafio na trilha é uma metáfora da vida. O TOP 1670 marcou a história de Porto Velho — 144 homens subiram a montanha e tiveram um encontro com o Legendário #01.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Diego Nascimento",
    city: "Porto Velho/RO",
    event: "TOP 1570 Destemidos Pioneiros",
    quote:
      "Prepare-se para viver dias de transformação, desafio e propósito. Eu era um homem perdido, sem direção. No TOP, encontrei meu chamado como pai, marido e servo de Deus. Homens inquebrantáveis com histórias dignas de serem contadas — esse é o Legendário.",
    rating: 5,
    featured: 1,
  },
  {
    name: "Lucas Ferreira",
    city: "Porto Velho/RO",
    event: "TOP 1670 Destemidos Pioneiros",
    quote:
      "O TOP 1670 começou e 144 homens subiram a montanha. Eu fui um deles. Nunca imaginei que em 72 horas minha vida seria completamente transformada. O Culto de Chegada com nossas famílias foi o momento mais emocionante da minha vida. Devolvemos o herói a cada família!",
    rating: 5,
    featured: 1,
  },
];

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    console.log("Conectado ao banco de dados.");

    // Limpar depoimentos antigos para atualizar com os novos
    await connection.execute("DELETE FROM testimonials");
    console.log("  ✓ Depoimentos antigos removidos.");

    for (const t of testimonials) {
      await connection.execute(
        `INSERT INTO testimonials (name, city, event, quote, rating, featured) 
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
