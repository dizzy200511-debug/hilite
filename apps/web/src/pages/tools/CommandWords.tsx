import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/Shell';
import { useToast } from '../../components/ui';
import { COMMAND_WORDS } from '../../content/commandWords';
import { STARTER_DECKS } from '../../content/starterDecks';
import { addToTopicDeck } from '../../lib/decks';
import { shuffle } from '../../lib/srs';

export default function CommandWords() {
  const [quiz, setQuiz] = useState<{ word: string; options: string[] }[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const toast = useToast();
  const nav = useNavigate();
  const start = () => {
    setQuiz(shuffle(COMMAND_WORDS).slice(0, 10).map((c) => ({ word: c.word, options: shuffle(shuffle(COMMAND_WORDS.filter((x) => x.word !== c.word)).slice(0, 3).map((x) => x.word).concat(c.word)) })));
    setI(0); setPicked(null); setRight(0);
  };
  const q = quiz?.[i];
  const def = q ? COMMAND_WORDS.find((c) => c.word === q.word)! : null;
  return (
    <>
      <Topbar title="Command words" sub="What each question word is asking you to do">
        <Link className="btn btn-ghost" to="/guides/command-words">Read the guide</Link>
        <button className="btn" onClick={() => { const deck = STARTER_DECKS.find((d) => d.id === 'command-words')!; const id = addToTopicDeck(deck.name, deck.cards.map(([f, b]) => ({ f, b }))); toast('Deck added'); nav('/flashcards/' + id); }}>Add as flashcards</button>
        {!quiz && <button className="btn btn-primary" onClick={start}>Quiz me</button>}
      </Topbar>
      <div className="content stack" style={{ maxWidth: 860 }}>
        {quiz && (
          <section className="panel panel-pad">
            {q && def ? (
              <>
                <div className="row between small muted" style={{ marginBottom: 10 }}><span>Question {i + 1} of {quiz.length}</span><span className="num">{right} right</span></div>
                <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Which command word means: {def.means.charAt(0).toLowerCase() + def.means.slice(1)}</p>
                <div className="stack" style={{ gap: 8 }}>{q.options.map((o) => {
                  const style = picked == null ? {} : o === q.word ? { borderColor: 'var(--good)', background: 'var(--good-soft)' } : o === picked ? { borderColor: 'var(--bad)', background: 'var(--bad-soft)' } : { opacity: 0.6 };
                  return <button key={o} className="btn btn-lg" style={{ justifyContent: 'flex-start', ...style }} disabled={picked != null} onClick={() => { setPicked(o); if (o === q.word) setRight(right + 1); }}>{o}</button>;
                })}</div>
                {picked != null && <div className="row between" style={{ marginTop: 12 }}><span className="small muted">Tip: {def.tip}</span><button className="btn btn-primary" autoFocus onClick={() => { setPicked(null); setI(i + 1); }}>Next</button></div>}
              </>
            ) : (
              <div className="row between"><b>{right} of {quiz.length} right.</b><div className="row"><button className="btn" onClick={() => setQuiz(null)}>Back to the list</button><button className="btn btn-primary" onClick={start}>Again</button></div></div>
            )}
          </section>
        )}
        <section className="panel">
          <div className="panel-body" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <table className="table"><thead><tr><th>Word</th><th>What it asks for</th><th className="hide-sm">Tip</th></tr></thead>
              <tbody>{COMMAND_WORDS.map((c) => <tr key={c.word}><td><b>{c.word}</b></td><td>{c.means}</td><td className="small muted hide-sm">{c.tip}</td></tr>)}</tbody></table>
          </div>
        </section>
        <p className="small muted">Boards publish their own command word lists, and meanings can differ slightly. Check your board’s list on its website for your subject.</p>
      </div>
    </>
  );
}
