import React, { useState } from 'react';
import "semantic-ui-css/semantic.min.css"
import { Header, Container, Grid, Input, Button, TextArea, Form, Divider, List } from 'semantic-ui-react'
import './App.css';
import { Result, Deck, Card } from './types'

const DeckList: React.FC = (props: any) => {
    const { deck } = props

    const cards = deck.maindeck.map((card: Card) => {
        return (
            <List.Item key={card.name}>
                {card.count} {card.name}
            </List.Item>
        )
    })
    return (
        <Container className="Deck">
            <List items={deck.maindeck}>
                {cards}
            </List>
        </Container>
    );
}

export default DeckList;
