const VERISON_STRING = "0.01.10"
const Footer = () => {
    return (
        <footer>
            <div>
                <p className='text-center p-2 '>
                    Built & maintained by <b>chipy</b> ({VERISON_STRING}) 
                    <br />
                    More info and bug reports on <a href="https://github.com/iamchipy/chipys-breeding-manager">GitHub</a>
                    <br />
                    Support my coding addition via <a href="https://www.paypal.com/donate/?hosted_button_id=KEYF8KWYJYSFU">Paypal</a>
                    
                </p>

            </div>
        </footer>
    );
};

export default Footer;