import { useState } from 'react';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import Panels from '@enact/sandstone/Panels';
import Main from '../views/Main';
import { useBackHandler, useCloseHandler, useDocumentEvent } from './AppState';
import { isDevServe } from '../libs/utils';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from '../views/Login';
import Header from '../components/Header';
import SpecificVideo from '../views/SpecificVideo';
import QrCode from '../views/QrCode';
import Not from '../views/Not';
import '../scss/HomeVideo.module.less';

/* istanbul ignore next*/
if (isDevServe()) {
	window.webOSSystem = {
		highContrast: 'off',
		close: () => { },
		platformBack: () => { },
		PmLogString: () => { },
		screenOrientation: 'landscape',
		setWindowOrientation: () => { }
	};
}

const App = props => {
	const [skinVariants, setSkinVariants] = useState({ highContrast: false });
	const handleBack = useBackHandler();
	const handleClose = useCloseHandler();
	useDocumentEvent(setSkinVariants);

	return (
		<Panels
			{...props}
			skinVariants={skinVariants}
			onBack={handleBack}
			onClose={handleClose}
		>
			<HashRouter>
				<Routes>
					<Route path="/" element={<Login />} />
					<Route path="/home" element={<Header />} />
					<Route path="/group/:groupId" element={<Header />} />
					<Route
						path="/group/:groupNum/video/:videoId"
						element={<SpecificVideo />}
					/>
					<Route exact path="/qrcode" element={<QrCode />} />
					<Route path="*" element={<Not />} />
				</Routes>
			</HashRouter>
			{/* <Main /> */}
		</Panels>
	);
};

export default ThemeDecorator(App);
