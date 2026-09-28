'use strict';
const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('.nav');
function closeMenu(){navigation?.classList.remove('is-open');menuButton?.setAttribute('aria-expanded','false');}
menuButton?.addEventListener('click',()=>{const opened=navigation.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(opened));});
navigation?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
window.matchMedia('(min-width: 851px)').addEventListener('change',event=>{if(event.matches)closeMenu();});

const bookingDialog=document.querySelector('#booking-dialog');
const form=document.querySelector('#booking-form');
const statusOutput=document.querySelector('#booking-status');
const whatsappNext=document.querySelector('#whatsapp-next');
const DAY=86400000;
function propertyToday(){const parts=new Intl.DateTimeFormat('en',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=type=>parts.find(part=>part.type===type).value;return get('year')+'-'+get('month')+'-'+get('day');}
function dateValue(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return NaN;const [y,m,d]=value.split('-').map(Number);const date=Date.UTC(y,m-1,d);return new Date(date).toISOString().slice(0,10)===value?date:NaN;}
function nextDay(value){return new Date(dateValue(value)+DAY).toISOString().slice(0,10);}
function formatDate(value){return value.split('-').reverse().join('/');}
function resetStatus(){statusOutput.textContent='';statusOutput.classList.remove('error');whatsappNext.hidden=true;whatsappNext.removeAttribute('href');}
if(bookingDialog&&form&&typeof bookingDialog.showModal==='function'){
  const arrival=form.elements.checkin,departure=form.elements.checkout;
  function limits(){const today=propertyToday();arrival.min=today;departure.min=nextDay(Number.isFinite(dateValue(arrival.value))&&arrival.value>=today?arrival.value:today);}
  limits();
  document.querySelectorAll('[data-book]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();closeMenu();resetStatus();limits();bookingDialog.showModal();}));
  bookingDialog.querySelector('.dialog-close').addEventListener('click',()=>bookingDialog.close());
  bookingDialog.addEventListener('click',event=>{if(event.target===bookingDialog){const rect=bookingDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)bookingDialog.close();}});
  arrival.addEventListener('change',()=>{limits();if(departure.value&&departure.value<departure.min)departure.value=departure.min;resetStatus();});
  form.addEventListener('input',resetStatus);
  form.addEventListener('submit',event=>{
    event.preventDefault();resetStatus();limits();
    const start=dateValue(arrival.value),end=dateValue(departure.value),guests=form.elements.guests.value;
    function fail(message,input){statusOutput.textContent=message;statusOutput.classList.add('error');input?.focus();}
    if(!Number.isFinite(start)||arrival.value<propertyToday())return fail('Escolha uma data de chegada a partir de hoje.',arrival);
    if(!Number.isFinite(end)||end<=start)return fail('A saída deve ser depois da chegada.',departure);
    if(!/^(?:[1-9]|1[0-2]|mais-de-12)$/.test(guests))return fail('Escolha a quantidade de hóspedes.',form.elements.guests);
    if(!form.reportValidity())return;
    const nights=(end-start)/DAY;
    const message='Olá! Gostaria de consultar uma hospedagem no Recanto das Águias.\n\nCheck-in: '+formatDate(arrival.value)+'\nCheck-out: '+formatDate(departure.value)+'\nPeríodo: '+nights+(nights===1?' noite':' noites')+'\nHóspedes, incluindo crianças: '+(guests==='mais-de-12'?'mais de 12':guests)+'\n\nPodem informar as acomodações indicadas para o grupo, a disponibilidade, o valor total e os horários de entrada e saída?';
    const url='https://wa.me/5585985487939?text='+encodeURIComponent(message);
    whatsappNext.href=url;whatsappNext.hidden=false;
    statusOutput.textContent='Consulta preparada. Envie a mensagem no WhatsApp para a equipe confirmar os detalhes da sua estadia.';
    window.open(url,'_blank','noopener,noreferrer');
  });
}

const galleryDialog=document.querySelector('#gallery-dialog');
if(galleryDialog&&typeof galleryDialog.showModal==='function'){
  const viewer=galleryDialog.querySelector('.gallery-image'),counter=galleryDialog.querySelector('.gallery-counter'),caption=galleryDialog.querySelector('.gallery-caption');
  const links=Array.from(document.querySelectorAll('[data-gallery]'));let current=0,origin=null;
  function display(index){current=(index+links.length)%links.length;const link=links[current];viewer.src=link.href;viewer.alt=link.querySelector('img')?.alt||'Recanto das Águias';counter.textContent='Recanto das Águias · '+(current+1)+' de '+links.length;caption.textContent=viewer.alt;}
  function openGallery(event,link,index){event.preventDefault();origin=link;closeMenu();display(index);galleryDialog.showModal();}
  links.forEach((link,index)=>link.addEventListener('click',event=>openGallery(event,link,index)));
  document.querySelectorAll('[data-open-gallery]').forEach(link=>link.addEventListener('click',event=>{const wanted=link.dataset.openGallery;const index=links.findIndex(item=>item.dataset.photo===wanted);openGallery(event,link,index<0?0:index);}));
  galleryDialog.querySelector('.gallery-prev').addEventListener('click',()=>display(current-1));
  galleryDialog.querySelector('.gallery-next').addEventListener('click',()=>display(current+1));
  galleryDialog.querySelector('.gallery-close').addEventListener('click',()=>galleryDialog.close());
  galleryDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();display(current-1);}if(event.key==='ArrowRight'){event.preventDefault();display(current+1);}});
  galleryDialog.addEventListener('close',()=>{origin?.focus();viewer.removeAttribute('src');});
}
