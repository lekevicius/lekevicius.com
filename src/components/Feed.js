import React from 'react' // { useState }
// import Modal from 'react-modal'
// import { MDXRenderer } from 'gatsby-plugin-mdx'

import Logo from '../assets/images/logo.inline.svg'
import Footer from './Footer'

import feed from './feed.json'

import PlaceholderBlock from '../blocks/placeholder/block'

import NewsletterBlock from '../blocks/newsletter/block'
import ProfileBlock from '../blocks/profile/block'
import ContactBlock from '../blocks/contact/block'
import SocialBlock from '../blocks/social/block'

import NFTGalleryBlock from '../blocks/nft-gallery/block'
// import LaptopStickersBlock from '../blocks/laptop-stickers/block'

import JobsBlock from '../blocks/jobs/block'
import ClientsBlock from '../blocks/clients/block'

// import SoundShapesBlock from '../blocks/sound-shapes/block'
// import AmoraBlock from '../blocks/amora/block'
// import FilmSpeechBlock from '../blocks/film-speech/block'
// import VijualBlock from '../blocks/vijual/block'

// import MrWordBlock from '../blocks/mr-word/block'

// import SugarRushBlock from '../blocks/sugar-rush/block'
// import SeerBlock from '../blocks/seer/block'
// import ChristmasPostcardsBlock from '../blocks/christmas-postcards/block'
// import AssetPressBlock from '../blocks/assetpress/block'
import LoopBlock from '../blocks/loop/block'
// import SpiralflowBlock from '../blocks/spiralflow/block'
// import PokemonHeatmapsBlock from '../blocks/pokemon-heatmaps/block'
// import GraphemeColorSynesthesiaBlock from '../blocks/grapheme-color-synesthesia/block'
// import ArturkaBlock from '../blocks/arturka/block'
// import CryptoproofBlock from '../blocks/cryptoproof/block'
// import October30Block from '../blocks/october-30/block'
// import CalendarCardBlock from '../blocks/calendar-card/block'
// import NewYearTimesBlock from '../blocks/new-year-times/block'
// import MonoringBlock from '../blocks/monoring/block'
import DuBitaiBlock from '../blocks/du-bitai/block'
import Header from './Header'
// import SystemDynamicBlock from '../blocks/system-dynamic/block'

const blocks = {
  'placeholder': PlaceholderBlock,

  'newsletter': NewsletterBlock,
  'profile': ProfileBlock,
  'contact': ContactBlock,
  'social': SocialBlock,

  'nft-gallery': NFTGalleryBlock,
  // 'laptop-stickers': LaptopStickersBlock,

  'jobs': JobsBlock,
  'clients': ClientsBlock,

  // 'sound-shapes': SoundShapesBlock,
  // 'amora': AmoraBlock,
  // 'film-speech': FilmSpeechBlock,
  // 'vijual': VijualBlock,

  // 'mr-word': MrWordBlock,

  // 'sugar-rush': SugarRushBlock,
  // 'seer': SeerBlock,
  // 'christmas-postcards': ChristmasPostcardsBlock,
  // 'assetpress': AssetPressBlock,
  'loop': LoopBlock,
  // 'spiralflow': SpiralflowBlock,
  // 'pokemon-heatmaps': PokemonHeatmapsBlock,
  // 'grapheme-color-synesthesia': GraphemeColorSynesthesiaBlock,
  // 'arturka': ArturkaBlock,
  // 'cryptoproof': CryptoproofBlock,
  // 'october-30': October30Block,
  // 'calendar-card': CalendarCardBlock,
  // 'new-year-times': NewYearTimesBlock,
  // 'monoring': MonoringBlock,
  'du-bitai': DuBitaiBlock,
  // 'system-dynamic': SystemDynamicBlock,
}

// const customStyles = {
//   content: {
//     top: '50%',
//     left: '50%',
//     right: 'auto',
//     bottom: 'auto',
//     marginRight: '-50%',
//     transform: 'translate(-50%, -50%)',
//   },
// };

// Modal.setAppElement('#___gatsby')

const Feed = ({data}) => {

  // let subtitle;
  // const [modalIsOpen, setIsOpen] = useState(false)
  // const [loadedContent, setLoadedContent] = useState('')

  // async function openModal() {
  //   let data = await window.___loader.loadPage('spiralflow')
  //   setLoadedContent(data.json.data.mdx.body)
  //   setIsOpen(true);
  // }

  // function afterOpenModal() {
  //   // references are now sync'd and can be accessed.
  //   subtitle.style.color = '#f00';
  //   document.body.style.overflow = 'hidden';
  // }

  // function closeModal() {
  //   setIsOpen(false);
  //   document.body.style.overflow = 'unset';
  // }

  return (
    <div className="pagewrap">
    <div className="max-w-[480px] lg:max-w-[1000px] mx-auto px-4 lg:px-10">

      {/* <button onClick={openModal}>Open Modal</button> */}
      {/* <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        className="Modal"
        overlayClassName="Overlay"
        contentLabel="Example Modal"
      >
        <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
        <button className="absolute -top-6 right-6 w-12 h-12 bg-orange-300" onClick={closeModal}>close</button>
        <div className="modal-content">
          <MDXRenderer>{loadedContent}</MDXRenderer>
        </div>
      </Modal> */}

      <Header isHome={true} data={data.site.siteMetadata} />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 items-stretch w-full">
        {
          false && // Tailwind class creation
          <>
            <div className="col-span-1 lg:col-span-1" />
            <div className="col-span-2 lg:col-span-2" />
            <div className="col-span-3 lg:col-span-3" />
            <div className="col-span-4 lg:col-span-4" />
            <div className="col-span-5 lg:col-span-5" />
            <div className="col-span-6 lg:col-span-6" />
            <div className="col-span-7 lg:col-span-7" />
            <div className="col-span-8 lg:col-span-8" />
            <div className="col-span-9 lg:col-span-9" />
            <div className="col-span-10 lg:col-span-10" />
            <div className="col-span-11 lg:col-span-11" />
            <div className="col-span-12 lg:col-span-12" />
          </>
        }
        {
          feed.map((line, lineIndex) => {
            let colsWithPrefs = 0
            let widthPrefSum = 0
            let widthPrefs = line.map((item) => {
              if (typeof item === 'object' && !Array.isArray(item) && item.w) {
                colsWithPrefs++
                widthPrefSum += item.w
                return item.w
              }
              else return 0
            })
            let unprefWidth = (12 - widthPrefSum) / (line.length - colsWithPrefs)
            let widths = widthPrefs.map((width) => width === 0 ? unprefWidth : width)

            return <React.Fragment key={`line${lineIndex}`}>{
              line.map((item, itemIndex) => {
                let contentKey = item
                if (typeof item === 'object' && !Array.isArray(item) && item.w) {
                  contentKey = item.c
                }

                if (Array.isArray(contentKey)) {
                  return <div key={contentKey.join('')} className={`flex flex-col gap-4 lg:gap-10 col-span-1 lg:col-span-${widths[itemIndex]}`}>
                    {
                      contentKey.map((subitem) => {
                        let Comp = subitem in blocks ? blocks[subitem] : blocks['placeholder']
                        return <Comp key={subitem} classes="rounded-3xl shadow" />;
                      })
                    }
                  </div>
                } else {
                  let Comp = contentKey in blocks ? blocks[contentKey] : blocks['placeholder']
                  return <Comp key={contentKey} classes={`col-span-1 lg:col-span-${widths[itemIndex]} rounded-3xl shadow`} />;
                }
              })
            }</React.Fragment>
          })
        }
      </main>
      <Footer isIndex={true} />
    </div>
    </div>
  )
}

export default Feed

// ["nft-gallery"],
// [{"w":8, "c": "updates"}, "idea-garden"],
// ["galaxis", "japan-2019"],