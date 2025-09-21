
import React from 'react';
import { FOOTER_TEXT } from '../constants';

const Footer: React.FC = () => {
    return (
        <footer className="w-full text-center p-6 text-gray-500 text-sm">
            <p>{FOOTER_TEXT}</p>
        </footer>
    );
};

export default Footer;
