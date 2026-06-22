const fs = require("fs");
const path = require("path");

const managers = [
  ["Pep Guardiola", ["Current Managers", "Premier League"], "Manchester City's serial trophy collector", "Pioneered modern positional play", "Former Barcelona and Bayern boss"],
  ["Jurgen Klopp", ["Historic Managers", "Champions League Winners"], "Liverpool's heavy-metal football icon", "Famous for 'gegenpressing'", "Left Liverpool in 2024 after years of success"],
  ["Carlo Ancelotti", ["Current Managers", "Champions League Winners"], "Real Madrid's calm trophy magnet", "Most Champions League titles of any coach", "Known for a relaxed man-management style"],
  ["Mikel Arteta", ["Current Managers", "Premier League"], "Arsenal's intense former captain", "Learned under Guardiola as an assistant", "Took Arsenal back to title contention"],
  ["Hansi Flick", ["Current Managers"], "German coach who won a treble with Bayern", "Now manages a Spanish giant", "Known for attacking, high-press football"],
  ["Xabi Alonso", ["Current Managers"], "Former midfielder turned title-winning coach", "Led an unbeaten Bundesliga season", "Now manages a Spanish giant"],
  ["Unai Emery", ["Current Managers"], "Spanish coach famous for Europa League success", "Took an unfancied club into the Champions League", "Won the Europa League multiple times"],
  ["Thomas Tuchel", ["Current Managers", "Champions League Winners"], "German coach who won the Champions League with Chelsea", "Now in charge of the England national team", "Known for tactical flexibility"],
  ["Erik ten Hag", ["Current Managers"], "Dutch coach who won an FA Cup at Old Trafford", "Previously dominated Dutch football with Ajax", "Known for his demanding standards"],
  ["Ange Postecoglou", ["Current Managers"], "Australian coach known for attacking philosophy", "Took Celtic to domestic dominance", "Famous quote about 'live by the sword'"],
  ["Roberto De Zerbi", ["Current Managers"], "Italian coach known for playing out from the back", "Made his name at a south coast English club", "Praised for bold possession football"],
  ["Diego Simeone", ["Current Managers"], "Argentine coach famous for fiery touchline passion", "Built a gritty identity at Atletico Madrid", "Former World Cup playing midfielder"],
  ["Luis Enrique", ["Current Managers", "Champions League Winners"], "Spanish coach who won a treble with Barcelona", "Now leads a French giant", "Former Barcelona and Spain captain as a player"],
  ["Julian Nagelsmann", ["Current Managers"], "Youngest ever Bundesliga title-winning coach", "Now leads the German national team", "Known as a tactical wunderkind"],

  ["Sir Alex Ferguson", ["Historic Managers", "Champions League Winners"], "Manchester United's most successful manager ever", "Won 13 Premier League titles", "Famous for the 'hairdryer treatment'"],
  ["Arsene Wenger", ["Historic Managers"], "Revolutionized English football nutrition and tactics", "Led Arsenal's unbeaten 'Invincibles' season", "Managed Arsenal for over two decades"],
  ["Jose Mourinho", ["Historic Managers", "Champions League Winners"], "Self-proclaimed 'Special One'", "Won the Champions League with two different clubs", "Famous for a touchline sprint celebration in 2004"],
  ["Pep Guardiola", ["Historic Managers"], "Won six trophies in his first season at Barcelona", "Architect of the famous 2009 Barca team", "Former Spain international midfielder"],
  ["Johan Cruyff", ["Historic Managers"], "Built Barcelona's legendary 'Dream Team'", "Pioneered the philosophy now known as tiki-taka", "Dutch legend who shaped Ajax's academy"],
  ["Brian Clough", ["Historic Managers", "Champions League Winners"], "Led unfashionable Nottingham Forest to back-to-back titles", "Famous for outspoken confidence", "Never managed the England national team despite calls"],
  ["Bill Shankly", ["Historic Managers"], "Built the foundations of Liverpool's modern dynasty", "Famous quote about football being 'more important than life'", "Scottish manager who transformed a struggling club"],
  ["Bob Paisley", ["Historic Managers", "Champions League Winners"], "Liverpool's most decorated manager by trophy count", "Won three European Cups", "Famously understated personality"],
  ["Helenio Herrera", ["Historic Managers"], "Pioneered the defensive 'catenaccio' system", "Led Inter Milan to back-to-back European Cups", "Argentine-French tactical innovator"],
  ["Rinus Michels", ["Historic Managers"], "Father of 'Total Football'", "Led the Netherlands to a World Cup final", "Shaped Ajax's golden era in the 1970s"],
  ["Marcello Lippi", ["Historic Managers", "World Cup Winners"], "Led Italy to World Cup glory in 2006", "Dominant Juventus coach in the 1990s", "Known for a calm, authoritative presence"],
  ["Vicente del Bosque", ["Historic Managers", "World Cup Winners"], "Led Spain to a World Cup and back-to-back Euros", "Won Champions Leagues as Real Madrid boss", "Known for a quiet, modest demeanor"],
  ["Luiz Felipe Scolari", ["Historic Managers", "World Cup Winners"], "Led Brazil to World Cup glory in 2002", "Famous for fiery man-management", "Also managed Chelsea and Portugal"],
  ["Aime Jacquet", ["Historic Managers", "World Cup Winners"], "Led France to its first World Cup on home soil", "Built the 1998 golden generation", "Faced heavy media criticism before the triumph"],
  ["Joachim Low", ["Historic Managers", "World Cup Winners"], "Led Germany to World Cup glory in 2014", "Oversaw a famous 7-1 semi-final win", "Long-serving German national team boss"],
  ["Didier Deschamps", ["Historic Managers", "World Cup Winners"], "Won the World Cup as both player and manager", "Captained France to glory in 1998", "Led France to another title in 2018"],
  ["Vicente del Bosque", ["Champions League Winners"], "Won two Champions Leagues with Real Madrid", "Later led Spain's golden generation", "Known for calm, patient leadership"],
  ["Ottmar Hitzfeld", ["Champions League Winners"], "Won the Champions League with two different German clubs", "Swiss-German tactical mastermind", "Later managed the Switzerland national team"],
  ["Frank Rijkaard", ["Historic Managers"], "Built the foundations of Barcelona's later dominance", "Former Dutch World Cup finalist as a player", "Brought Ronaldinho-era flair to Barcelona"],
  ["Fabio Capello", ["Historic Managers"], "Dominant title-winning coach across multiple countries", "Managed Real Madrid, Milan, and England", "Known for a strict disciplinarian approach"],
  ["Giovanni Trapattoni", ["Historic Managers"], "Won league titles in four different countries", "Famous outspoken press conferences", "Long, decorated career across Europe"],
  ["Marcelo Bielsa", ["Historic Managers"], "Argentine coach famous for relentless pressing", "Nicknamed 'El Loco' for his intensity", "Influenced a generation of modern coaches"],
  ["Antonio Conte", ["Current Managers"], "Italian coach famous for intense touchline energy", "Won titles in England and Italy", "Known for a back-three tactical system"],
  ["Massimiliano Allegri", ["Current Managers"], "Pragmatic Italian coach with multiple Serie A titles", "Long association with Juventus", "Known for defensive solidity"],
  ["Zinedine Zidane", ["Historic Managers", "Champions League Winners"], "Won three straight Champions Leagues as a coach", "Former World Cup winning playmaker", "Surprisingly successful debut managerial spell"],
  ["Sir Bobby Robson", ["Historic Managers"], "Beloved English coach who led England to a World Cup semi", "Managed top clubs across multiple countries", "Mentored a young Mourinho as a translator"],
  ["Ottmar Hitzfeld", ["Historic Managers"], "Won European Cups with Dortmund and Bayern", "Known as 'The General' in Germany", "Swiss national team manager later in career"],
  ["Louis van Gaal", ["Historic Managers"], "Won titles with Ajax, Barcelona, and Bayern", "Famous for blunt honesty in interviews", "Led the Netherlands to a World Cup semi-final"],
  ["Sven-Goran Eriksson", ["Historic Managers"], "First foreign manager of the England national team", "Known for a calm, measured demeanor", "Led England to consecutive quarter-finals"],
];

const entities = managers.map(([name, categories, hintEasy, hintMedium, hintHard], i) => ({
  id: `manager-${i + 1}`,
  name,
  type: "manager",
  hintEasy,
  hintMedium,
  hintHard,
  categories,
}));

const outPath = path.join(__dirname, "..", "src", "data-packs", "base-pack", "managers.json");
fs.writeFileSync(outPath, JSON.stringify(entities, null, 2));
console.log(`Wrote ${entities.length} managers to ${outPath}`);
