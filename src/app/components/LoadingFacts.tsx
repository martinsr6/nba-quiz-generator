import { useState, useEffect } from 'react';

const NBA_FACTS = [
  "During the 1978-79 season, Kevin Porter of the Detroit Pistons recorded 29 assists in a single game, which stood as the NBA record until Scott Skiles broke it in 1990.",
  "The NBA's first slam dunk contest in 1984 was actually won by Larry Nance Sr., not Julius Erving who won the ABA contest in 1976.",
  "Manute Bol, at 7'7\", made six 3-pointers in a single half for the Philadelphia 76ers in 1993, despite making only 43 in his entire career.",
  "The Memphis Grizzlies were originally founded as the Vancouver Grizzlies in 1995, making them the first NBA team based in Canada alongside the Toronto Raptors.",
  "Detlef Schrempf was the first NBA player to shoot over 50% from the field, 40% from three, and 80% from the free-throw line in a season (1994-95).",
  "The NBA briefly used a synthetic basketball made by Spalding for the first few months of the 2006-07 season before reverting to leather balls after player complaints.",
  "Earl Boykins, at just 5'5\" and 135 pounds, once bench pressed 315 pounds, more than twice his body weight.",
  "The San Antonio Spurs' team colors (silver and black) were chosen by their original owner, Red McCombs, to match the colors of his car dealership.",
  "In the 1950s, NBA players had to work summer jobs because their basketball salaries weren't enough to live on year-round.",
  "The 1986 NBA Draft is considered one of the most tragic, with second pick Len Bias dying of a cocaine overdose two days after being drafted and four other first-rounders never playing due to drug issues.",
  "Latrell Sprewell once turned down a $21 million contract offer, saying he had 'a family to feed,' and never played in the NBA again.",
  "The NBA's three-point line was originally added as a gimmick to compete with the ABA, and many coaches initially instructed players not to use it.",
  "Dennis Rodman once missed a game during the 1998 NBA Finals to attend a WCW wrestling event where he appeared alongside Hulk Hogan.",
  "The NBA's 24-second shot clock was invented after Syracuse Nationals owner Danny Biasone calculated the ideal number of shots per game by dividing the 48-minute game by 24 seconds.",
  "Rasheed Wallace holds the NBA record for technical fouls in a season with 41 in 2000-01, which led the NBA to change its rules about player conduct.",
  "The 1998-99 NBA season was shortened to just 50 games due to a lockout, and teams sometimes played three games in three nights during the compressed schedule.",
  "Kobe Bryant's 81-point game against the Toronto Raptors in 2006 included zero assists, making it the highest-scoring game ever without an assist.",
  "The NBA's first official game was played on November 1, 1946, between the New York Knickerbockers and the Toronto Huskies, with New York winning 68-66.",
  "The Boston Celtics and Los Angeles Lakers have met in the NBA Finals 12 times, with Boston winning 9 of those matchups.",
  "The 1985-86 Boston Celtics went 40-1 at home during the regular season and playoffs combined, the best home record in NBA history.",
  "The NBA's first African-born player was Hakeem Olajuwon from Nigeria, who was drafted first overall by the Houston Rockets in 1984.",
  "The 'Malice at the Palace' brawl in 2004 resulted in nine players being suspended for a total of 146 games, the most severe penalties for an on-court incident in NBA history.",
  "The NBA's first official international game was played in 1984 between the Phoenix Suns and New Jersey Nets in Milan, Italy.",
  "The 1971-72 Los Angeles Lakers won 33 consecutive games, which remains the longest winning streak in major American professional sports.",
  "The NBA's first million-dollar contract was signed by Magic Johnson in 1981, a 25-year deal worth $25 million with the Lakers.",
  "The 'Hack-a-Shaq' strategy was actually first used against Dennis Rodman, not Shaquille O'Neal, by Spurs coach Gregg Popovich.",
  "The NBA's first official three-point shot was made by Chris Ford of the Boston Celtics on October 12, 1979.",
  "The Chicago Bulls won 72 games in the 1995-96 season despite Dennis Rodman missing 18 games due to suspensions and injuries.",
  "The NBA's first official game ball was manufactured by Spalding and had eight panels instead of the current design's eight panels and two end panels.",
  "The 1988-89 Miami Heat set an NBA record by losing their first 17 games as an expansion team.",
  "The NBA's first official international player was Hank Biasatti, who was born in Italy but raised in Canada, and played for the Toronto Huskies in 1946.",
  "The 'Jordan Rules' defensive strategy used by the Detroit Pistons involved different tactics depending on where Michael Jordan was on the court, not just hard fouls.",
  "The NBA's first official salary cap was implemented in the 1984-85 season and was set at $3.6 million per team.",
  "The 1993-94 Denver Nuggets became the first 8th seed to defeat a 1st seed in the playoffs when they beat the Seattle SuperSonics.",
  "The NBA's first official MVP award was given to Bob Pettit of the St. Louis Hawks in the 1955-56 season.",
  "The 'Showtime' Lakers of the 1980s were actually named after the Lakers' owner Jerry Buss's vision for entertainment at the Forum, not their playing style.",
  "The NBA's first official draft was held in 1947, and the first overall pick was Clifton McNeely, who never played in the NBA.",
  "The 1969 NBA Finals MVP was awarded to Jerry West of the Los Angeles Lakers, despite his team losing to the Boston Celtics, the only time this has happened.",
  "The NBA's first official All-Star Game was played in 1951 at Boston Garden, with the East beating the West 111-94.",
  "The 'Bad Boys' Detroit Pistons of the late 1980s had a set of rules called the 'Jordan Rules' specifically designed to contain Michael Jordan."
];

interface LoadingFactsProps {
  startTime?: number;
  expectedDuration?: number;
}

export default function LoadingFacts({ startTime = Date.now(), expectedDuration = 30000 }: LoadingFactsProps) {
  const [currentFact, setCurrentFact] = useState(NBA_FACTS[0]);
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Change fact every 5 seconds
    const factInterval = setInterval(() => {
      const randomFact = NBA_FACTS[Math.floor(Math.random() * NBA_FACTS.length)];
      setCurrentFact(randomFact);
    }, 5000);

    // Animate loading dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Update progress bar
    const progressInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(elapsed);
      
      // Calculate progress as a percentage of expected duration, capped at 99%
      const calculatedProgress = Math.min(99, (elapsed / expectedDuration) * 100);
      setProgress(calculatedProgress);
    }, 100);

    return () => {
      clearInterval(factInterval);
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, [startTime, expectedDuration]);

  // Format elapsed time as seconds
  const formatElapsedTime = () => {
    const seconds = Math.floor(elapsedTime / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="max-w-2xl mx-auto text-center p-8">
      <div className="mb-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="text-lg font-semibold mt-4">Generating your quiz{dots}</p>
        
        {/* Progress bar */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {formatElapsedTime()} elapsed
          {progress >= 90 && " - Almost done!"}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-500 ease-in-out hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sicko Fact:</h3>
        <p className="text-gray-700">{currentFact}</p>
      </div>
    </div>
  );
} 