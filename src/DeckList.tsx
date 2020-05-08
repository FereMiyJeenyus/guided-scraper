import React, { ChangeEvent } from 'react';
import "semantic-ui-css/semantic.min.css"
import { Grid, Input, Button, List } from 'semantic-ui-react'
import './App.css';
import { Result, Card } from './types'

interface DeckListProps {
    result: Result;
    goToNextDeck();
    goToPreviousDeck();
    setDisplayedDeck(Result: Result);
}

const DeckList: React.FC<DeckListProps> = (props: DeckListProps) => {
    const { result, goToNextDeck, goToPreviousDeck, setDisplayedDeck } = props

    const toggleCardHighlight = (card: Card) => {
        const { deck } = result
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
        setDisplayedDeck({ ...result, deck })
    }

    const cards = result && result.deck.maindeck.map((card: Card) => {
        return (
            <List.Item key={card.name} onClick={() => toggleCardHighlight(card)} className={card.highlighted ? 'highlight' : ''}>
                {card.count} {card.name}
            </List.Item>
        )
    })

    const sideboardCards = result && result.deck.sideboard.map((card: Card) => {
        return (
            <List.Item key={card.name} onClick={() => toggleCardHighlight(card)} className={card.highlighted ? 'highlight' : ''}>
                {card.count} {card.name}
            </List.Item>
        )
    })

    const handleSetArchetype = (e: ChangeEvent, data: any) => {
        const { value } = data
        setDisplayedDeck({ ...result, archetype: value })
    }

    const handleKeyPress = (e: any, data: any) => {
        if (e.key === 'Enter') {
            goToNextDeck();
        }
    }

    return (
        <Grid width={16} >
            <Grid.Row>
                <Grid.Column width={12}>
                    <Input label="Archetype" value={result.archetype} onChange={handleSetArchetype} onKeyPress={handleKeyPress} />
                </Grid.Column>
                <Grid.Column width={2}>
                    <Button onClick={goToPreviousDeck} content="Previous" />
                </Grid.Column>
                <Grid.Column width={2}>
                    <Button onClick={goToNextDeck} content="Next" />
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
    );
}

export default DeckList;
