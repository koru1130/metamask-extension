import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions';
import { getMetaMaskAccounts } from '../../../selectors';
import Button from '../../../components/ui/button';
import { getMostRecentOverviewPage } from '../../../ducks/history/history';
import { EVENT, EVENT_NAMES } from '../../../../shared/constants/metametrics';

class PrivateKeysImportView extends Component {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    importNewAccount: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    displayWarning: PropTypes.func.isRequired,
    setSelectedAddress: PropTypes.func.isRequired,
    firstAddress: PropTypes.string.isRequired,
    error: PropTypes.node,
    mostRecentOverviewPage: PropTypes.string.isRequired,
  };

  inputRef = React.createRef();

  state = { isEmpty: true };

  createNewKeychains() {
    const privateKey = this.inputRef.current.value;
    const {
      importNewAccount,
      history,
      displayWarning,
      mostRecentOverviewPage,
      setSelectedAddress,
      firstAddress,
    } = this.props;
    const { t } = this.context;

    importNewAccount('Private Keys', [privateKey])
      .then(({ selectedAddress }) => {
        if (selectedAddress) {
          this.context.trackEvent({
            category: EVENT.CATEGORIES.ACCOUNTS,
            event: EVENT_NAMES.ACCOUNT_ADDED,
            properties: {
              account_type: EVENT.ACCOUNT_TYPES.IMPORTED,
              account_import_type: EVENT.ACCOUNT_IMPORT_TYPES.PRIVATE_KEY,
            },
          });
          history.push(mostRecentOverviewPage);
          displayWarning(null);
        } else {
          displayWarning(t('importAccountError'));
          this.context.trackEvent({
            category: EVENT.CATEGORIES.ACCOUNTS,
            event: EVENT_NAMES.ACCOUNT_ADD_FAILED,
            properties: {
              account_type: EVENT.ACCOUNT_TYPES.IMPORTED,
              account_import_type: EVENT.ACCOUNT_IMPORT_TYPES.PRIVATE_KEY,
            },
          });
          setSelectedAddress(firstAddress);
        }
      })
      .catch((err) => err && displayWarning(err.message || err));
  }

  notCreateKeyringOnEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    //   this.createNewKeychain();
    }
  };

  checkInputEmpty() {
    const privateKey = this.inputRef.current.value;
    let isEmpty = true;
    if (privateKey !== '') {
      isEmpty = false;
    }
    this.setState({ isEmpty });
  }

  render() {
    const { error, displayWarning } = this.props;

    return (
      <div className="new-account-import-form__private-key">
        <span className="new-account-import-form__instruction">
          {this.context.t('pastePrivateKey')}
        </span>
        <div className="new-account-import-form__private-key-password-container">
          <textarea
            className="new-account-import-form__input-password"
            // type="password"
            id="private-key-box"
            onKeyPress={(e) => this.notCreateKeyringOnEnter(e)}
            onChange={() => this.checkInputEmpty()}
            ref={this.inputRef}
            autoFocus
          />
        </div>
        <div className="new-account-import-form__buttons">
          <Button
            type="secondary"
            large
            className="new-account-create-form__button"
            onClick={() => {
              const { history, mostRecentOverviewPage } = this.props;
              displayWarning(null);
              history.push(mostRecentOverviewPage);
            }}
          >
            {this.context.t('cancel')}
          </Button>
          <Button
            type="primary"
            large
            className="new-account-create-form__button"
            onClick={() => this.createNewKeychains()}
            disabled={this.state.isEmpty}
          >
            {this.context.t('import')}
          </Button>
        </div>
        {error ? <span className="error">{error}</span> : null}
      </div>
    );
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(PrivateKeysImportView);

function mapStateToProps(state) {
  return {
    error: state.appState.warning,
    firstAddress: Object.keys(getMetaMaskAccounts(state))[0],
    mostRecentOverviewPage: getMostRecentOverviewPage(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    importNewAccount: (strategy, [privateKey]) => {
      return dispatch(actions.importNewAccount(strategy, [privateKey]));
    },
    displayWarning: (message) =>
      dispatch(actions.displayWarning(message || null)),
    setSelectedAddress: (address) =>
      dispatch(actions.setSelectedAddress(address)),
  };
}
