import React, { useState, useEffect, ChangeEvent } from 'react';
import "semantic-ui-css/semantic.min.css"
import { Header, Container, Grid, Input, Button, TextArea, Form, Divider, List, Modal, GridColumn, Message, Progress } from 'semantic-ui-react'
import './App.css';
import { getDecksFromUrl } from './scraper'
import { Result, Card, Deck } from './types'
import DeckList from './DeckList'

const App: React.FC = () => {
  const [hasScraped, setHasScraped] = useState<boolean>(false)
  const [wotcUrl, setWotcUrl] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [markup, setMarkup] = useState<string[]>([]);
  const [displayedDeck, setDisplayedDeck] = useState<Result>();
  const [displayedDeckIndex, setDisplayedDeckIndex] = useState<number>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [scrapeError, setScrapeError] = useState<boolean>(false);

  useEffect(() => {
    if (results && !hasScraped) {
      setDisplayedDeck(results[0])
      setDisplayedDeckIndex(0)
    }
  }, [results, hasScraped]);

  const generateMarkupLine = (result: Result): string => {
    const { deck, archetype, pilot, duplicatePilot, url } = result

    const muUrl = `[${archetype || 'archetype'}](${url})`
    const muPilot = `**${pilot.replace(/[_]/g, "\\_")}${
      duplicatePilot ? " (duplicate pilot, link points to other list)" : ""}**`

    const highlights = [...deck.maindeck.filter(c => c.highlighted), ...deck.sideboard.filter(c => c.highlighted)].map(c => c.name)
    const muHighlights = `(${Array.from(new Set(highlights)).join(", ")})`
    return `* ${muUrl}: ${muPilot} ${highlights.length ? muHighlights : ""}`
  }

  const generateMarkup = (results: Result[]) => {
    const mu: string[] = [];
    for (const result of results) {
      const muString = generateMarkupLine(result)
      mu.push(muString)
    }
    setMarkup(mu);
  }

  const generateCardCounts = (results: Result[]) => {
    const cardCounts: { card: Card, decks: number }[] = []
    results.forEach(r => {
      r.deck.maindeck.forEach(card => {
        const countRow = cardCounts.find(c => c.card.name === card.name);
        if (!countRow) {
          cardCounts.push({
            card: { name: card.name, count: card.count, highlighted: false },
            decks: 1
          })
        }
        else {
          countRow.card.count += card.count;
          countRow.decks++;
        }
      })

      r.deck.sideboard.forEach(card => {
        const countRow = cardCounts.find(c => c.card.name === card.name);
        if (!countRow) {
          cardCounts.push({
            card: { name: card.name, count: card.count, highlighted: false },
            decks: 1
          })
        }
        else {
          countRow.card.count += card.count;
          if (!r.deck.maindeck.find(c => c.name === card.name)) {
            countRow.decks++;
          }
        }
      })
    })

    cardCounts.sort((a, b) => b.card.count - a.card.count)
    //TODO make this visible somewhere
  }


  const scrape = async () => {
    try {
      const scrapedResults = await getDecksFromUrl(wotcUrl);
      generateMarkup(scrapedResults);
      generateCardCounts(scrapedResults);
      setResults(scrapedResults);
      setHasScraped(true);
    } catch (error) {
      setScrapeError(true)
    }
  }

  const toggleCardHighlight = (card: Card) => {
    const { deck } = displayedDeck!
    for (const c of deck.maindeck) {
      if (c.name === card.name) {
        c.highlighted = !c.highlighted
      }
    }
    for (const c of deck.sideboard) {
      if (c.name === card.name) {
        c.highlighted = !c.highlighted
      }
    }
    setDisplayedDeck({ ...displayedDeck!, deck })
  }

  const cards = displayedDeck && displayedDeck.deck.maindeck.map((card: Card) => {
    return (
      <List.Item key={card.name} onClick={() => toggleCardHighlight(card)} className={card.highlighted ? 'highlight' : ''}>
        {card.count} {card.name}
      </List.Item>
    )
  })

  const sideboardCards = displayedDeck && displayedDeck.deck.sideboard.map((card: Card) => {
    return (
      <List.Item key={card.name} onClick={() => toggleCardHighlight(card)} className={card.highlighted ? 'highlight' : ''}>
        {card.count} {card.name}
      </List.Item>
    )
  })

  const setNextDeck = () => {
    if (!displayedDeck) {
      return
    }
    const index = displayedDeckIndex!

    const res = [...results]
    res[index] = displayedDeck;
    setResults(res);

    const mu = markup
    mu[index] = generateMarkupLine(displayedDeck)
    setMarkup(mu)
    if (index + 2 < results.length) {
      console.log(results[index])
      setDisplayedDeck(results[index + 1])
      setDisplayedDeckIndex(index + 1);
    }
    else {
      setModalOpen(false);
    }
  }

  const setPreviousDeck = () => {
    if (!displayedDeck) {
      return
    }
    const index = displayedDeckIndex!

    const res = [...results]
    res[index] = displayedDeck;
    setResults(res);

    const mu = [...markup]
    mu[index] = generateMarkupLine(displayedDeck)
    setMarkup(mu)

    if (index !== 0) {
      console.log(results[index - 1])
      setDisplayedDeck(results[index - 1])
      setDisplayedDeckIndex(index - 1);
    }
    else {
      setModalOpen(false);
    }
  }

  const handleSetArchetype = (e: ChangeEvent, data: any) => {
    const { value } = data
    const deck: Result = { ...displayedDeck!, archetype: value as string }
    console.log(deck)
    setDisplayedDeck(deck)
  }


  const handleKeyPress = (e: any, data: any) => {
    if (e.key === 'Enter') {
      setNextDeck();
    }
  }

  return (
    <Container className="App">
      <Header>Scraper</Header>
      <Grid columns={16}>
        <Grid.Row>
          <Grid.Column width={3} textAlign="left">
            <Input value={wotcUrl} onChange={(e) => setWotcUrl(e.target.value)} placeholder="Deck Dump URL" />
            <a
              href='https://magic.wizards.com/en/content/deck-lists-magic-online-products-game-info'
              target='_blank'
              style={{ marginLeft: '1em' }}>
              MTGO Results
            </a>
          </Grid.Column>
          <Grid.Column width={2} textAlign="left">
            <Button onClick={scrape} content="Scrape" />
          </Grid.Column>
          <Grid.Column width={2} textAlign="left">
            <Button onClick={() => (setModalOpen(true))} content="Start" />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={16}>
            {scrapeError &&
              <Message negative>
                <p>There was an error while attempting to scrape results. Please try again later</p>
              </Message>
            }
            <Form>
              <Form.TextArea value={markup?.join("\r\n")} style={{ height: 500 }} />
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Modal
        open={modalOpen && !!displayedDeck}
        centered={false}
        onClose={() => setModalOpen(false)}
        closeOnDimmerClick={false}
        closeIcon>
        <Modal.Content>
          {displayedDeck &&
            <Grid width={16} >
              <Grid.Row>
                <Grid.Column width={12}>
                  <Input label="Archetype" value={displayedDeck.archetype} onChange={handleSetArchetype} onKeyPress={handleKeyPress} />
                </Grid.Column>
                <Grid.Column width={2}>
                  <Button onClick={setPreviousDeck} content="Previous" />
                </Grid.Column>
                <Grid.Column width={2}>
                  <Button onClick={setNextDeck} content="Next" />
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column width={4}>
                  <List>
                    {cards}
                  </List>
                </Grid.Column>
                <Grid.Column width={4}>
                  <List>
                    {sideboardCards}
                  </List>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          }
          <Progress value={displayedDeckIndex} total={results.length} progress='ratio' style={{ marginTop: '1em', marginBottom: 0 }} />
        </Modal.Content>
      </Modal>
    </Container>
  );
}

export default App;
