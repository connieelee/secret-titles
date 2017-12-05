import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Grid from 'material-ui/Grid';
import {
  Board,
  SpyMastersStatus,
  CurrentTurn,
  PastTurns,
  GameOver,
} from './';

import {
  createRoom,
  createBoard,
  createKeyCard,
  createSpymasters,
  listenOnSpymasters,
  listenOnCurrentTurn,
  deleteRoom,
} from '../../reducers/actionCreators';

const mapState = state => {
  const { gameOver, currentTurn } = state;
  const colors = {
    RED: '#FFCDD2',
    BLUE: '#1E88E5',
  };
  return {
    boardBgColor: gameOver.winner ? colors[gameOver.winner] : colors[currentTurn.team],
    gameIsOver: gameOver.status,
  };
};
const mapDispatch = dispatch => ({
  setup: () => (
    dispatch(createRoom())
    .then(() => {
      dispatch(createBoard());
      dispatch(createKeyCard());
      dispatch(createSpymasters());
    })
  ),
  disconnect: () => { dispatch(deleteRoom()); },
  listenOnSpymasters: () => dispatch(listenOnSpymasters()),
  listenOnCurrentTurn: () => dispatch(listenOnCurrentTurn()),
});

class LocalGame extends React.Component {
  componentDidMount() {
    this.props.setup()
    .then(() => {
      const unsubscribes = [];
      unsubscribes.push(this.props.listenOnSpymasters());
      unsubscribes.push(this.props.listenOnCurrentTurn());
      this.stopListeners = unsubscribes.forEach(func => () => func());
    });
    if (window.onbeforeunload !== undefined) {
      window.onbeforeunload = () => this.props.disconnect();
    } else if (window.onpagehide !== undefined) {
      window.onpagehide = () => this.props.disconnect();
    }
  }

  componentWillUnmount() {
    this.props.disconnect();
    if (this.stopListening) this.stopListening();
  }

  render() {
    return (
      <Grid container className="full-height">
        <Grid
          item
          lg={8}
          container
          alignItems="center"
          justify="center"
          style={{ backgroundColor: this.props.boardBgColor }}
        >
          <Board item />
        </Grid>
        {this.props.gameIsOver ?
          <Grid item lg={4} style={{ width: '100%' }}>
            <Grid item><GameOver /></Grid>
            <Grid item><PastTurns /></Grid>
          </Grid> :
          <Grid item lg={4} style={{ width: '100%' }}>
            <Grid item><SpyMastersStatus /></Grid>
            <Grid item><CurrentTurn /></Grid>
            <Grid item><PastTurns /></Grid>
          </Grid>}
      </Grid>
    );
  }
}

LocalGame.propTypes = {
  gameIsOver: PropTypes.bool.isRequired,
  boardBgColor: PropTypes.string,
  setup: PropTypes.func.isRequired,
  listenOnSpymasters: PropTypes.func.isRequired,
  listenOnCurrentTurn: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
};
LocalGame.defaultProps = {
  boardBgColor: '#607D8B',
};

export default connect(mapState, mapDispatch)(LocalGame);
