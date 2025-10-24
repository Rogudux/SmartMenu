import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
  IonCard, IonCardContent, IonBadge, IonButton, IonIcon,
  IonSkeletonText, IonModal, IonInput, IonTextarea, IonToggle,
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonAlert, IonToast
} from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Platillo } from '../../models/platillo';
import { PlatilloService, CreatePlatilloDto, UpdatePlatilloDto } from '../../services/platillo.service';

type FiltroDisponibilidad = 'todos' | 'disponibles';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [
    CommonModule, CurrencyPipe, ReactiveFormsModule,
    IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
    IonCard, IonCardContent, IonBadge, IonButton, IonIcon,
    IonSkeletonText, IonModal, IonInput, IonTextarea, IonToggle,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonAlert, IonToast
  ],
})
export class MenuComponent implements OnInit {
  private platilloSrv = inject(PlatilloService);
  private fb = inject(FormBuilder);

  platillos: Platillo[] = [];
  loading = true;
  error = false;

  // UI state
  query = '';
  filtro: FiltroDisponibilidad = 'todos';

  // Modal/Form
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  form!: FormGroup;

  // feedback
  toastMsg = '';
  showToast = false;

  ngOnInit() {
    this.buildForm();
    this.load();
  }

  buildForm() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      disponible: [true, []],
    });
  }

  load() {
    this.loading = true;
    this.error = false;
    this.platilloSrv.getAllPlatillos().subscribe({
      next: (data) => { this.platillos = data ?? []; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  // filtros/búsqueda
  onSearch(q: string) { this.query = (q || '').trim().toLowerCase(); }
  onFiltroChange(value: FiltroDisponibilidad) { this.filtro = value; }

  get listaFiltrada(): Platillo[] {
    let list = [...this.platillos];
    if (this.filtro === 'disponibles') list = list.filter(p => p.disponible);
    if (this.query) {
      const q = this.query;
      list = list.filter(p =>
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.descripcion || '').toLowerCase().includes(q)
      );
    }
    // “recomendados”: disponibles primero, luego nombre
    return list.sort((a, b) => Number(b.disponible) - Number(a.disponible) || a.nombre.localeCompare(b.nombre));
  }

  // —— Crear / Editar —— //
  abrirNuevo(ev?: Event) {
    ev?.preventDefault(); ev?.stopPropagation();
    this.isEditing = false;
    this.editingId = null;
    this.form.reset({ nombre: '', descripcion: '', precio: 0, disponible: true });
    this.showModal = true;
  }

  abrirEditar(p: Platillo, ev?: Event) {
    ev?.preventDefault(); ev?.stopPropagation();
    this.isEditing = true;
    this.editingId = p.id;
    this.form.setValue({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      disponible: p.disponible,
    });
    this.showModal = true;
  }

  cerrarModal() { this.showModal = false; }

  guardar() {
    if (this.form.invalid) return;
    const body = this.form.value as CreatePlatilloDto | UpdatePlatilloDto;

    if (this.isEditing && this.editingId != null) {
      this.platilloSrv.updatePlatillo(this.editingId, body as UpdatePlatilloDto).subscribe({
        next: (upd) => {
          const idx = this.platillos.findIndex(x => x.id === upd.id);
          if (idx > -1) this.platillos[idx] = upd;
          this.toast('Platillo actualizado');
          this.cerrarModal();
        },
        error: (e) => { console.error('[Menu][update][error]', e); this.toast('Error al actualizar'); }
      });
    } else {
      this.platilloSrv.createPlatillo(body as CreatePlatilloDto).subscribe({
        next: (created) => {
          this.platillos.unshift(created);
          this.toast('Platillo creado');
          this.cerrarModal();
        },
        error: (e) => { console.error('[Menu][create][error]', e); this.toast('Error al crear'); }
      });
    }
  }

  // —— Eliminar —— //
  eliminar(p: Platillo, ev?: Event) {
    ev?.preventDefault(); ev?.stopPropagation();
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    this.platilloSrv.deletePlatillo(p.id).subscribe({
      next: () => {
        this.platillos = this.platillos.filter(x => x.id !== p.id);
        this.toast('Platillo eliminado');
      },
      error: (e) => { console.error('[Menu][delete][error]', e); this.toast('Error al eliminar'); }
    });
  }

  private toast(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 1600);
  }
}
