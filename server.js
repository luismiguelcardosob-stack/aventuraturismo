import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;

// Nesta primeira versão, o bridge gera arquivos .txt por setor.
// Troque a função sendToPrinter() pelo driver ESC/POS da sua impressora
// quando soubermos os modelos/IPs das duas impressoras.
const out = path.resolve('./spool');
fs.mkdirSync(out,{recursive:true});

function ticketText(p){
  const lines = [
    '================================',
    (p.company || 'AVENTURA TURISMO').toUpperCase(),
    (p.boat || 'CAPITÃO GANCHO').toUpperCase(),
    `SETOR: ${p.sector}`,
    '================================',
    `COMANDA: ${p.tab}`,
    p.customer ? `CLIENTE: ${p.customer}` : '',
    `HORA: ${new Date(p.createdAt || Date.now()).toLocaleString('pt-BR')}`,
    '--------------------------------',
    ...((p.items||[]).map(i => `${i.qty}x ${i.name}`)),
    '--------------------------------',
    'NOVO PEDIDO',
    '\n\n'
  ].filter(Boolean);
  return lines.join('\n');
}

async function sendToPrinter(sector,text){
  const stamp = Date.now();
  const file = path.join(out, `${sector}_${stamp}.txt`);
  fs.writeFileSync(file,text,'utf8');
  console.log(`Ticket ${sector} salvo: ${file}`);
  // PRÓXIMO PASSO:
  // BAR      -> IP/nome da impressora do bar
  // COZINHA  -> IP/nome da impressora da cozinha
}

app.post('/print', async (req,res)=>{
  try{
    const sector = req.body.sector;
    if(!['BAR','COZINHA'].includes(sector)) return res.status(400).json({error:'Setor inválido'});
    const text=ticketText(req.body);
    await sendToPrinter(sector,text);
    res.json({ok:true,sector});
  }catch(e){res.status(500).json({error:String(e)});}
});

app.post('/test', async (req,res)=>{
  const sector=req.body.sector;
  if(!['BAR','COZINHA'].includes(sector)) return res.status(400).json({error:'Setor inválido'});
  await sendToPrinter(sector,`AVENTURA TURISMO\nCAPITÃO GANCHO\nTESTE IMPRESSORA ${sector}\n\n`);
  res.json({ok:true});
});

app.get('/health',(req,res)=>res.json({ok:true,service:'Aventura Print Bridge'}));
app.listen(PORT,()=>console.log(`Print Bridge rodando em http://localhost:${PORT}`));
