import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import {
  setFeatureFlag,
  setIpfsGateway,
  setParticipateInMetaMetrics,
  setUseCurrencyRateCheck,
  setUseMultiAccountBalanceChecker,
  setUsePhishDetect,
  setUseTokenDetection,
  setUseAddressBarEnsResolution,
  setUseSafeChainsListValidation,
} from '../../../store/actions';
import SecurityTab from './security-tab.component';

const mapStateToProps = (state) => {
  const {
    appState: { warning },
    metamask,
  } = state;
  const {
    featureFlags: { showIncomingTransactions } = {},
    participateInMetaMetrics,
    usePhishDetect,
    useTokenDetection,
    ipfsGateway,
    useMultiAccountBalanceChecker,
    useSafeChainsListValidation,
    useCurrencyRateCheck,
    useAddressBarEnsResolution,
  } = metamask;

  return {
    warning,
    showIncomingTransactions,
    participateInMetaMetrics,
    usePhishDetect,
    useTokenDetection,
    ipfsGateway,
    useMultiAccountBalanceChecker,
    useSafeChainsListValidation,
    useCurrencyRateCheck,
    useAddressBarEnsResolution,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setParticipateInMetaMetrics: (val) =>
      dispatch(setParticipateInMetaMetrics(val)),
    setShowIncomingTransactionsFeatureFlag: (shouldShow) =>
      dispatch(setFeatureFlag('showIncomingTransactions', shouldShow)),
    setUsePhishDetect: (val) => dispatch(setUsePhishDetect(val)),
    setUseCurrencyRateCheck: (val) => dispatch(setUseCurrencyRateCheck(val)),
    setUseTokenDetection: (val) => dispatch(setUseTokenDetection(val)),
    setIpfsGateway: (val) => dispatch(setIpfsGateway(val)),
    setUseMultiAccountBalanceChecker: (val) =>
      dispatch(setUseMultiAccountBalanceChecker(val)),
    setUseSafeChainsListValidation: (val) =>
      dispatch(setUseSafeChainsListValidation(val)),
    setUseAddressBarEnsResolution: (val) =>
      dispatch(setUseAddressBarEnsResolution(val)),
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(SecurityTab);
