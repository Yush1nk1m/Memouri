import Alert from '@enact/sandstone/Alert';
import BodyText from '@enact/sandstone/BodyText';
import Button from '@enact/sandstone/Button';
import {Panel} from '@enact/sandstone/Panels';
import {usePopup} from './MainState';
import Header from '../components/Header';
import $L from '@enact/i18n/$L';
import {useProcStat, useUnitList} from '../hooks/useData';
import Login from './Login';

const Main = props => {
	const procStat = useProcStat();
	const unitList = useUnitList();

	return <main id="main">{props.children}</main>;
};

export default Main;
