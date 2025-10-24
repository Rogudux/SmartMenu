import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonList, IonItem, IonIcon, IonLabel, IonBadge, IonButton,
  IonModal, IonInput, IonSelect, IonSelectOption,
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonToast
} from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { Pedido } from '../../models/pedido';
import { PedidoService, CreatePedidoDto } from '../../services/pedido.service';

type Filtro = 'todos' | 'listo' | 'en preparacion' | 'pendiente' | 'entregado';

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.scss'],
  imports: [
    CommonModule, DatePipe, ReactiveFormsModule,
    IonList, IonItem, IonIcon, IonLabel, IonBadge, IonButton,
    IonModal, IonInput, IonSelect, IonSelectOption,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonToast
  ],
})
export class ListaPedidosComponent implements OnInit {
  private pedidoSrv = inject(PedidoService);
  private fb = inject(FormBuilder);

  /** Filtro recibido desde la Tab */
  @Input() filtro: Filtro = 'todos';

  pedidos: Pedido[] = [];
  loading = true;
  error = false;

  // Modal / Form
  showModal = false;
  isEditing = false;
  editingId: number | null = null;

  form!: FormGroup;
  get platillosFA(): FormArray<FormGroup> {
    return this.form.get('platillos') as FormArray<FormGroup>;
  }

  // Toast
  toastMsg = '';
  showToast = false;

  ngOnInit() {
    this.buildForm();
    this.load();
  }

  // ---------- Form ----------
  private buildForm() {
    this.form = this.fb.group({
      mesa: [1, [Validators.required, Validators.min(1)]],
      idUsuario: [1, [Validators.required, Validators.min(1)]],
      estado: ['pendiente', [Validators.required]],
      platillos: this.fb.array([ this.newPlatRow() ]),
    });
  }

  /** crea una fila del form para un platillo */
  private newPlatRow(data?: { idPlatillo: number|null; cantidad: number|null }) {
    return this.fb.group({
      idPlatillo: [data?.idPlatillo ?? null, [Validators.required, Validators.min(1)]],
      cantidad:   [data?.cantidad ?? 1,      [Validators.required, Validators.min(1)]],
    });
  }

  /** coloca N filas en el FormArray a partir del detalle */
  private setPlatillosRows(detalle?: Array<{ idPlatillo:number; cantidad:number }>) {
    const fa = this.platillosFA;
    while (fa.length) fa.removeAt(0);
    if (Array.isArray(detalle) && detalle.length) {
      detalle.forEach(d => fa.push(this.newPlatRow({ idPlatillo: d.idPlatillo, cantidad: d.cantidad })));
    } else {
      fa.push(this.newPlatRow()); // al menos 1 fila
    }
  }

  addPlatRow() { this.platillosFA.push(this.newPlatRow()); }
  removePlatRow(i: number) { if (this.platillosFA.length > 1) this.platillosFA.removeAt(i); }

  // ---------- Data ----------
  load() {
    this.loading = true;
    this.error = false;

    this.pedidoSrv.getAllPedidos().subscribe({
      next: (data) => {
        this.pedidos = (data ?? []).sort((a, b) => this.comparePedidos(a, b));
        this.loading = false;
      },
      error: (e) => {
        this.error = true;
        this.loading = false;
        console.error('[Pedidos][error]', e);
      }
    });
  }

  reload() { this.load(); }

  // ---------- helpers ----------
  /** Intenta convertir cualquier valor a Date. Si falla, regresa null (para no romper el DatePipe). */
  toDate(v: any): Date | null {
    const d = new Date(String(v));
    return isNaN(d.getTime()) ? null : d;
  }

  // ---------- Orden / Filtro / Colores ----------
  private norm(s = '') { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  private categoriaEstado(estado: string): Filtro | 'otros' {
    const e = this.norm(estado);
    if (e.startsWith('listo')) return 'listo';
    if (e.includes('prepa')) return 'en preparacion';
    if (e.startsWith('pend')) return 'pendiente';
    if (e.startsWith('entreg')) return 'entregado';
    return 'otros';
  }
  private comparePedidos(a: Pedido, b: Pedido): number {
    const pri: Record<string, number> = { 'listo': 0, 'en preparacion': 1, 'pendiente': 2, 'entregado': 3, 'otros': 4 };
    const ca = pri[this.categoriaEstado(a.estado)];
    const cb = pri[this.categoriaEstado(b.estado)];
    if (ca !== cb) return ca - cb;

    const da = this.toDate(a.fecha)?.getTime() ?? 0;
    const db = this.toDate(b.fecha)?.getTime() ?? 0;
    return db - da;
  }
  get pedidosFiltrados(): Pedido[] {
    if (this.filtro === 'todos') return this.pedidos;
    return this.pedidos.filter(p => this.categoriaEstado(p.estado) === this.filtro);
  }
  estadoClase(estado: string) {
    const e = this.norm(estado);
    if (e.startsWith('listo'))   return 'estado estado--listo';
    if (e.includes('prepa'))     return 'estado estado--preparacion';
    if (e.startsWith('pend'))    return 'estado estado--pendiente';
    if (e.startsWith('entreg'))  return 'estado estado--entregado';
    return 'estado estado--otros';
  }

  // ---------- Crear / Editar ----------
  abrirNuevo() {
    this.isEditing = false;
    this.editingId = null;
    this.form.reset({ mesa: 1, idUsuario: 1, estado: 'pendiente' });

    // habilita todo para creación
    this.form.get('mesa')?.enable();
    this.form.get('idUsuario')?.enable();
    this.platillosFA.enable();

    // deja solo 1 fila limpia
    while (this.platillosFA.length > 1) this.platillosFA.removeAt(0);
    this.platillosFA.reset();
    (this.platillosFA.at(0) as FormGroup).reset({ idPlatillo: null, cantidad: 1 });

    this.showModal = true;
  }

  abrirEditar(p: Pedido) {
    this.isEditing = true;
    this.editingId = p.id;

    // campos base
    this.form.patchValue({
      mesa: p.mesa,
      idUsuario: p.idUsuario,
      estado: (this.categoriaEstado(p.estado) as 'pendiente'|'en preparacion'|'listo'|'entregado') || 'pendiente',
    });

    // Deshabilita inputs que el backend NO actualiza (solo cambia estado)
    this.form.get('mesa')?.disable();
    this.form.get('idUsuario')?.disable();
    this.platillosFA.disable();

    this.showModal = true;

    // 1) Si ya viene el detalle en la lista, úsalo
  

    // 2) Si no viene, pide /pedidos/:id y mapea
    
  }

  cerrarModal() { this.showModal = false; }

  guardar() {
    if (this.form.invalid) return;

    // EDITAR: cambia solo el ESTADO usando /:id/estado
    if (this.isEditing) {
      if (this.editingId == null) return;
      const estado = this.form.get('estado')?.value as 'pendiente'|'en preparacion'|'listo'|'entregado';

      this.pedidoSrv.updatePedidoEstado(this.editingId, estado).subscribe({
        next: (upd) => {
          const idx = this.pedidos.findIndex(x => x.id === this.editingId);
          if (idx > -1) {
            this.pedidos[idx] = { ...this.pedidos[idx], estado: upd?.estado ?? estado };
            this.pedidos = [...this.pedidos].sort((a,b)=>this.comparePedidos(a,b));
          }
          this.toast('Estado actualizado');
          this.cerrarModal();
        },
        error: () => this.toast('No se pudo actualizar el estado'),
      });
      return; // ⛔ no tocar mesa, idUsuario ni platillos en edición
    }

    // CREAR: valida que haya al menos un platillo
    const v = this.form.getRawValue(); // por si quedó algo disabled accidentalmente
    const platillos = (v.platillos || []).filter((x: any) => x && x.idPlatillo && x.cantidad > 0);
    if (!platillos.length) { this.toast('Incluye al menos un platillo'); return; }

    const body: CreatePedidoDto = {
      mesa: v.mesa,
      idUsuario: v.idUsuario,
      estado: v.estado as any,
      platillos
    };

    this.pedidoSrv.createPedido(body).subscribe({
      next: (created) => {
        this.pedidos.unshift(created);
        this.pedidos = [...this.pedidos].sort((a,b)=>this.comparePedidos(a,b));
        this.toast('Pedido creado');
        this.cerrarModal();
      },
      error: () => this.toast('Error al crear'),
    });
  }

  // ---------- Eliminar ----------
  eliminar(p: Pedido) {
    if (!confirm(`¿Eliminar el pedido #${p.id} (Mesa ${p.mesa})?`)) return;
    this.pedidoSrv.deletePedido(p.id).subscribe({
      next: () => {
        this.pedidos = this.pedidos.filter(x => x.id !== p.id);
        this.toast('Pedido eliminado');
      },
      error: () => this.toast('Error al eliminar'),
    });
  }

  // ---------- Toast ----------
  private toast(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 1600);
  }

  trackById(_i: number, p: Pedido) { return p.id; }
}
