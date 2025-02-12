// Flashcard.jsx
import React, { useState, useEffect } from 'react';

const Flashcard = ({cards, collection_id, navigate}) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [text, setText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [shuffleMode, setShuffleMode] = useState(false);

    {/*If there is at least one card in the deck, display its front content on page load*/}
    useEffect(() => {
        if (cards && cards.length > 0) {
            setText(cards[0].FRONT_CONTENT);
        }
    }, [cards]);

    {/*Flip between front and back content when the user clicks the card*/}
    const handleClick = () => {
        setText(text === cards[currentCardIndex].FRONT_CONTENT 
            ? cards[currentCardIndex].BACK_CONTENT 
            : cards[currentCardIndex].FRONT_CONTENT
        );
    };

    {/*randomMode will select a random index between 0 and the size of the deck.
       It then "displays a random card" by that index,
       making sure that the new index is different from the previous one to prevent randomly occurring repetitions */}
    const randomMode = () => {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * cards.length);
        } while (randomIndex === currentCardIndex);
        
        setCurrentCardIndex(randomIndex);
        setText(cards[randomIndex].FRONT_CONTENT);
    };

    {/*If not in shuffle mode, display the next card. Stop if the array index will go out of bounds*/}
    const nextCard = () => {
        if (shuffleMode) {
            randomMode();
            return;
        }

        if (currentCardIndex < cards.length - 1) {
            const nextIndex = currentCardIndex + 1;
            setCurrentCardIndex(nextIndex);
            setText(cards[nextIndex].FRONT_CONTENT);
        }
    };

    {/*If not in shuffle mode, display the previous card. Stop if the array index will go out of bounds*/}
    const previousCard = () => {
        if (shuffleMode) {
            randomMode();
            return;
        }

        if (currentCardIndex > 0) {
            const nextIndex = currentCardIndex - 1;
            setCurrentCardIndex(nextIndex);
            setText(cards[nextIndex].FRONT_CONTENT);
        }
    };

    {/*Simply reset the index to 0 and display that first card, allowing the user to begin iterating through the deck from the beginning */}
    const restartDeck = () => {
        setCurrentCardIndex(0);
        if (cards.length > 0) {
            setText(cards[0].FRONT_CONTENT);
        }
    };

    {/*Simply toggle shuffle mode on and off*/}
    const shuffleDeck = () => {
        setShuffleMode(prev => !prev);
    };

    {/*Handle an empty deck*/}
    const renderEmptyState = () => (
        <div className="card flashcard-fc">
            <div className="card-body d-flex flex-column justify-content-center align-items-center mt-2">
                <p className="text-center mb-3">
                    <i className="bi bi-plus-circle" style={{ fontSize: '2rem' }}></i>
                </p>
                <p className="text-center">
                    This deck is empty. Click the 'Edit Deck' button below to start adding cards!
                </p>
            </div>
        </div>
    );

    {/*Render clickable flashcard*/}
    const renderFlashcard = () => (
        <div className="card flashcard-fc">
            <div 
                className="card-body d-flex flex-row justify-content-center align-items-center mt-2" 
                onClick={handleClick} 
                style={{ cursor: "pointer" }}
            >
                <b>{text}</b>
            </div>
        </div>
    );

    return (
        <>  
            {errorMsg && <p className="text-danger">{errorMsg}</p>}

            {/*Display the deck name*/}
            <h1 className="coiny-regular">{cards.length > 0 ? cards[0].COLLECTION_NAME : "New Deck"}</h1>
            
            {/*Either render the flashcards or the empty state if no flashcards exist*/}
            {cards.length > 0 ? renderFlashcard() : renderEmptyState()}

            <div className="d-flex flex-row justify-content-center mt-2">
                <button 
                    type="button" 
                    className="btn btn-primary mx-2 my-1" 
                    onClick={previousCard}
                    disabled={cards.length === 0}
                >
                    <i className="bi bi-arrow-left-circle-fill"></i>
                </button>
                <button 
                    type="button" 
                    className="btn btn-primary mx-2 my-1" 
                    onClick={nextCard}
                    disabled={cards.length === 0}
                >
                    <i className="bi bi-arrow-right-circle-fill"></i>
                </button>
                <button 
                    type="button" 
                    className="btn btn-primary mx-2 my-1" 
                    onClick={shuffleDeck} 
                    disabled={cards.length === 0}
                    style={{ 
                        backgroundColor: "purple", 
                        color: shuffleMode ? "green" : "red", 
                        borderColor: "purple" 
                    }}
                >
                    <i className="bi bi-shuffle"></i>
                </button>
                <button 
                    type="button" 
                    className="btn btn-primary mx-2 my-1" 
                    onClick={restartDeck} 
                    disabled={cards.length === 0}
                    style={{ 
                        backgroundColor: "purple", 
                        color: "white", 
                        borderColor: "purple" 
                    }}
                >
                    <i className="bi bi-arrow-repeat"></i>
                </button>
                <button 
                    type="button" 
                    className="btn btn-warning mx-2 my-1" 
                    onClick={() => navigate(`/edit-deck/${collection_id}`)}
                >
                    Edit Deck
                </button>
            </div>
        </>
    );
};

export default Flashcard;